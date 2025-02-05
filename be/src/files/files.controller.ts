import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = uuidv4();
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiOperation({ summary: 'Upload a file' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(pdf|jpg|jpeg|png|csv|xlsx)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024, // 5MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @GetUser() user: User,
  ) {
    return this.filesService.create(file, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all files for the current user' })
  @ApiResponse({ status: 200, description: 'Return all files' })
  findAll(@GetUser() user: User) {
    return this.filesService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file by id' })
  @ApiResponse({ status: 200, description: 'Return a file' })
  @ApiResponse({ status: 404, description: 'File not found' })
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.filesService.findOne(id, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete file by id' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.filesService.remove(id, user.id);
  }
}
