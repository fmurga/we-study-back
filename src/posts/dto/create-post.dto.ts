import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';
import { Tag } from 'src/tags/entities/tag.entity';

export class CreatePostDto {
  @IsString()
  @IsOptional()
  title?: string;
  @IsString()
  @IsOptional()
  slug?: string;
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description: string;
  @IsOptional()
  tags?: any;
  @IsString()
  @IsOptional()
  image: string;
  @IsString()
  @IsOptional()
  file: string;
}
