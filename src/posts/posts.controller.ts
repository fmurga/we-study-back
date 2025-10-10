import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from 'src/files/helpers';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Auth, GetUser } from 'src/auth/decorators';
import { ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ValidRoles } from 'src/auth/interfaces';
import { User } from 'src/auth/entities/user.entity';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  @Post()
  @Auth(ValidRoles.user, ValidRoles.admin)
  @ApiResponse({ status: 201, description: 'Post was created', type: Post })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized request' })
  @ApiResponse({ status: 403, description: 'Forbidden. Token related.' })
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
    }),
  )
  async create(
    @Body() createPostDto: CreatePostDto,
    @GetUser() user: User,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000000000 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    let uploadedFile = null;
    if (file !== undefined) {
      uploadedFile = await this.cloudinaryService.uploadImage(file);
    }
    return this.postsService.create(createPostDto, user, uploadedFile);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.postsService.findAll(paginationDto);
  }

  @Get('lesson/:lessonId')
  @ApiResponse({ status: 200, description: 'Return posts by lesson' })
  findByLesson(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.postsService.findByLesson(lessonId, paginationDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.postsService.findOne(term);
  }

  @Patch(':id')
  @Auth(ValidRoles.user, ValidRoles.admin)
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
    }),
  )
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000000000 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    let uploadedFile = null;
    if (file !== undefined) {
      uploadedFile = await this.cloudinaryService.uploadImage(file);
    }
    return this.postsService.update(id, updatePostDto, uploadedFile);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.remove(id);
  }
}
