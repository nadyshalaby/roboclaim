import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import pdf from 'pdf-parse';
import { createWorker } from 'tesseract.js';
import { parse } from 'csv-parse/sync';
import * as xlsx from 'xlsx';
import { File, FileStatus, FileType } from '../entities/file.entity';
import { FileGateway } from '../gateways/file.gateway';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface PdfData {
  text: string;
  numpages: number;
  metadata: Record<string, unknown>;
  version: string;
}

interface ExtractedData {
  text?: string;
  numPages?: number;
  metadata?: Record<string, unknown>;
  version?: string;
  confidence?: number;
  words?: unknown[];
  records?: Record<string, unknown>[];
  [key: string]: unknown;
}

interface TesseractResult {
  text: string;
  confidence: number;
  blocks: unknown[];
}

interface CsvParseResult {
  records: Record<string, unknown>[];
}

type ExcelParseResult = Record<string, unknown>[];

@Processor('file-processing')
export class FileProcessor {
  private readonly logger = new Logger(FileProcessor.name);

  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly fileGateway: FileGateway,
    private readonly configService: ConfigService,
  ) {}

  @Process('process')
  async processFile(
    job: Job<{
      fileId: string;
      filePath: string;
      fileType: FileType;
      userId: string;
    }>,
  ) {
    const { fileId, filePath, fileType, userId } = job.data;
    this.logger.debug(`Processing file ${fileId} of type ${fileType}`);

    try {
      // Validate file exists
      if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
      }

      await this.fileRepository.update(fileId, {
        status: FileStatus.PROCESSING,
      });
      this.fileGateway.notifyFileStatus(userId, fileId, FileStatus.PROCESSING);

      // Add file size validation
      const stats = fs.statSync(filePath);
      const maxSize = this.configService.get<number>(
        'MAX_FILE_SIZE',
        10 * 1024 * 1024,
      ); // 10MB default
      if (stats.size > maxSize) {
        throw new Error('File size exceeds maximum limit');
      }

      let extractedData: ExtractedData;
      const startTime = Date.now();

      switch (fileType) {
        case FileType.PDF:
          extractedData = await this.processPdf(filePath);
          break;
        case FileType.IMAGE:
          extractedData = await this.processImage(filePath);
          break;
        case FileType.CSV:
          extractedData = this.processCsv(filePath);
          break;
        case FileType.EXCEL:
          extractedData = this.processExcel(filePath);
          break;
      }

      const processingTime = Date.now() - startTime;

      await this.fileRepository.update(fileId, {
        status: FileStatus.COMPLETED,
        extractedData,
        processingTime,
        processedAt: new Date(),
      } as Partial<File>);

      this.logger.debug(
        `File ${fileId} processed successfully in ${processingTime}ms`,
      );
      this.fileGateway.notifyFileStatus(
        userId,
        fileId,
        FileStatus.COMPLETED,
        extractedData,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error processing file ${fileId}: ${errorMessage}`);
      await this.fileRepository.update(fileId, {
        status: FileStatus.FAILED,
        errorMessage,
      });
      this.fileGateway.notifyFileStatus(userId, fileId, FileStatus.FAILED, {
        error: errorMessage,
      });
    } finally {
      // Cleanup temporary files if needed
      try {
        if (filePath.includes('temp') && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch {
        this.logger.warn(`Failed to cleanup temporary file ${filePath}`);
      }
    }
  }

  private async processPdf(filePath: string): Promise<ExtractedData> {
    const dataBuffer = fs.readFileSync(filePath);
    try {
      const data = (await pdf(dataBuffer)) as PdfData;
      return {
        text: data.text,
        numPages: data.numpages,
        metadata: data.metadata,
        version: data.version,
      };
    } catch (error) {
      this.logger.error(`Error processing PDF file ${filePath}: ${error}`);
      throw error;
    }
  }

  private async processImage(filePath: string): Promise<ExtractedData> {
    const worker = await createWorker();
    try {
      await worker.load('eng+osd');
      await worker.reinitialize('eng');
      type WorkerResult = { data: TesseractResult };
      const result = (await worker.recognize(filePath)) as WorkerResult;
      const { data } = result;
      return {
        text: data.text,
        confidence: data.confidence,
        words: data.blocks,
      };
    } finally {
      await worker.terminate();
    }
  }

  private processCsv(filePath: string): ExtractedData {
    const content = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const { records } = parse(content, {
      columns: true,
      skip_empty_lines: true,
    }) as CsvParseResult;
    return { records };
  }

  private processExcel(filePath: string): ExtractedData {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const records = xlsx.utils.sheet_to_json(worksheet) as ExcelParseResult;
    return { records };
  }
}
