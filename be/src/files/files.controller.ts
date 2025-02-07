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
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserDto } from './dto/user.dto';
import * as fs from 'fs';
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
        destination: (req, file, cb) => {
          const uploadDir = path.join(
            process.cwd(),
            'uploads',
            (req.user as UserDto).userId,
          );

          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }

          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const randomName = uuidv4();
          cb(null, `${randomName}${path.extname(file.originalname)}`);
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
    @GetUser() user: UserDto,
  ) {
    return this.filesService.create(file, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all files for the current user' })
  @ApiResponse({ status: 200, description: 'Return all files' })
  findAll(@GetUser() user: UserDto) {
    return this.filesService.findAll(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file by id' })
  @ApiResponse({ status: 200, description: 'Return a file' })
  @ApiResponse({ status: 404, description: 'File not found' })
  findOne(@Param('id') id: string, @GetUser() user: UserDto) {
    return this.filesService.findOne(id, user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete file by id' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  remove(@Param('id') id: string, @GetUser() user: UserDto) {
    return this.filesService.remove(id, user.userId);
  }
}
