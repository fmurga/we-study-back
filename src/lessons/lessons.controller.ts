import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@ApiTags('lessons')
@Controller('lessons')
export class LessonsController {
  constructor(
    private readonly lessonsService: LessonsService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  @Post()
  @Auth(ValidRoles.user)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Lesson created successfully' }) async create(
    @Body() createLessonDto: CreateLessonDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let uploadedFile;
    if (file) {
      uploadedFile = await this.cloudinaryService.uploadImage(file);
    }
    return this.lessonsService.create(createLessonDto, uploadedFile);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Return all lessons' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.lessonsService.findAll(paginationDto);
  }

  @Get('by-tag/:tagId')
  @ApiResponse({ status: 200, description: 'Return lessons by tag' })
  findByTag(
    @Param('tagId', ParseUUIDPipe) tagId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.lessonsService.findByTag(tagId, paginationDto);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Return lesson by id' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.lessonsService.findOnePlain(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.user)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Lesson updated successfully' }) async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let uploadedFile;
    if (file) {
      uploadedFile = await this.cloudinaryService.uploadImage(file);
    }
    return this.lessonsService.update(id, updateLessonDto, uploadedFile);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  @ApiResponse({ status: 200, description: 'Lesson deleted successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.lessonsService.remove(id);
  }
}
