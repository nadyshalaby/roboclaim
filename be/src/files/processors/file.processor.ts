import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as pdf from 'pdf-parse';
import { createWorker } from 'tesseract.js';
import { parse } from 'csv-parse/sync';
import * as xlsx from 'xlsx';
import { File, FileStatus, FileType } from '../entities/file.entity';
import { FileGateway } from '../gateways/file.gateway';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
      const maxSize = this.configService.get('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB default
      if (stats.size > maxSize) {
        throw new Error('File size exceeds maximum limit');
      }

      let extractedData: any;
      const startTime = Date.now();

      switch (fileType) {
        case FileType.PDF:
          extractedData = await this.processPdf(filePath);
          break;
        case FileType.IMAGE:
          extractedData = await this.processImage(filePath);
          break;
        case FileType.CSV:
          extractedData = await this.processCsv(filePath);
          break;
        case FileType.EXCEL:
          extractedData = await this.processExcel(filePath);
          break;
      }

      const processingTime = Date.now() - startTime;

      await this.fileRepository.update(fileId, {
        status: FileStatus.COMPLETED,
        extractedData,
        processingTime,
        processedAt: new Date(),
      });

      this.logger.debug(
        `File ${fileId} processed successfully in ${processingTime}ms`,
      );
      this.fileGateway.notifyFileStatus(
        userId,
        fileId,
        FileStatus.COMPLETED,
        extractedData,
      );
    } catch (error) {
      this.logger.error(`Error processing file ${fileId}: ${error.message}`);
      await this.fileRepository.update(fileId, {
        status: FileStatus.FAILED,
        errorMessage: error.message,
      });
      this.fileGateway.notifyFileStatus(userId, fileId, FileStatus.FAILED, {
        error: error.message,
      });
    } finally {
      // Cleanup temporary files if needed
      try {
        if (filePath.includes('temp') && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        this.logger.warn(`Failed to cleanup temporary file ${filePath}`);
      }
    }
  }

  private async processPdf(filePath: string): Promise<any> {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return {
      text: data.text,
      numPages: data.numpages,
      metadata: data.metadata,
      version: data.version,
    };
  }

  private async processImage(filePath: string): Promise<any> {
    const worker = await createWorker();
    try {
      await worker.load('eng+osd');
      await worker.reinitialize('eng');
      const { data } = await worker.recognize(filePath);
      return {
        text: data.text,
        confidence: data.confidence,
        words: data.blocks,
      };
    } finally {
      await worker.terminate();
    }
  }

  private async processCsv(filePath: string): Promise<any> {
    const content = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
    });
    return { records };
  }

  private async processExcel(filePath: string): Promise<any> {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    return { records: data };
  }
}
