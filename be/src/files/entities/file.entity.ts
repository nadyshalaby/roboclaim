import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum FileStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum FileType {
  PDF = 'pdf',
  IMAGE = 'image',
  CSV = 'csv',
  EXCEL = 'excel',
}

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalName: string;

  @Column()
  filename: string;

  @Column()
  path: string;

  @Column()
  mimeType: string;

  @Column({ type: 'enum', enum: FileType })
  type: FileType;

  @Column({ type: 'enum', enum: FileStatus, default: FileStatus.PENDING })
  status: FileStatus;

  @Column({ type: 'jsonb', nullable: true })
  extractedData: any;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @ManyToOne(() => User, (user) => user.files)
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  processingTime: number;

  @Column({ nullable: true })
  processedAt: Date;

  @Column({ nullable: true })
  fileSize: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
