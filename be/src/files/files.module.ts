import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { FileProcessor } from './processors/file.processor';
import { File } from './entities/file.entity';
import { FileGateway } from './gateways/file.gateway';
import { WsJwtAuthGuard } from './guards/ws-jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = uuid();
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'file-processing',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION', '1d'),
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  controllers: [FilesController],
  providers: [FilesService, FileProcessor, FileGateway, WsJwtAuthGuard],
  exports: [FilesService],
})
export class FilesModule {}
