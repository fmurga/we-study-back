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
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  tags?: Tag[];
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  images?: string[];
}
