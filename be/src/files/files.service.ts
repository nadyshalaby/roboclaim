import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as fs from 'fs';
import * as path from 'path';
import { File, FileStatus, FileType } from './entities/file.entity';
import { ConfigService } from '@nestjs/config';

interface FileMetadata {
  uploadedFrom: string;
  encoding: string;
}

export interface FileCreateResult {
  id: string;
  path: string;
}

@Injectable()
export class FilesService {
  private readonly allowedMimeTypes = new Map<string, FileType>([
    ['application/pdf', FileType.PDF],
    ['image/png', FileType.IMAGE],
    ['image/jpeg', FileType.IMAGE],
    ['text/csv', FileType.CSV],
    [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      FileType.EXCEL,
    ],
  ]);

  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    @InjectQueue('file-processing') private fileProcessingQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  async create(file: Express.Multer.File, userId: string) {
    // Validate file size
    const maxSize = this.configService.get<number>(
      'MAX_FILE_SIZE',
      10 * 1024 * 1024,
    );
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds the maximum limit');
    }

    const fileType = this.getFileType(file.mimetype);
    const uploadDir = path.join(process.cwd(), 'uploads', userId);

    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, file.filename);

      const newFile = this.fileRepository.create({
        originalName: file.originalname,
        filename: file.filename,
        path: filePath,
        mimeType: file.mimetype,
        type: fileType,
        userId,
        fileSize: file.size,
        metadata: {
          uploadedFrom: file.originalname,
          encoding: file.encoding,
        } as FileMetadata,
      });

      const savedFile = (await this.fileRepository.save(
        newFile,
      )) as FileCreateResult;

      // Add job to queue with retry options
      await this.fileProcessingQueue.add(
        'process',
        {
          fileId: savedFile.id,
          filePath: savedFile.path,
          fileType,
          userId,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      );

      return savedFile;
    } catch (error) {
      // Cleanup on error
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to process file: ${errorMessage}`);
    }
  }

  async findAll(
    userId: string,
    options?: {
      page?: number;
      limit?: number;
      status?: FileStatus;
      type?: FileType;
    },
  ) {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.fileRepository
      .createQueryBuilder('file')
      .where('file.userId = :userId', { userId });

    if (options?.status) {
      queryBuilder.andWhere('file.status = :status', {
        status: options.status,
      });
    }

    if (options?.type) {
      queryBuilder.andWhere('file.type = :type', { type: options.type });
    }

    const [files, total] = await queryBuilder
      .orderBy('file.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      files,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const file = await this.fileRepository.findOne({
      where: { id, userId },
    });

    if (!file) {
      throw new NotFoundException(`File with ID "${id}" not found`);
    }

    return file;
  }

  async remove(id: string, userId: string) {
    const file = await this.findOne(id, userId);

    try {
      fs.unlinkSync(file.path);
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    await this.fileRepository.remove(file);
    return { message: 'File deleted successfully' };
  }

  private getFileType(mimeType: string): FileType {
    const fileType = this.allowedMimeTypes.get(mimeType);
    if (!fileType) {
      throw new BadRequestException(`Unsupported file type: ${mimeType}`);
    }
    return fileType;
  }
}
