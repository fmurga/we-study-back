import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

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
  @IsUUID()
  @IsOptional()
  lessonId?: string;
}
