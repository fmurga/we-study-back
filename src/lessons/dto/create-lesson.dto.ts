import { IsArray, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsString()
  @MaxLength(1000)
  description: string;

  @IsOptional()
  @IsUrl()
  image?: string;

  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @IsOptional()
  @IsArray()
  materials?: string[];

  @IsOptional()
  @IsArray()
  tags?: string[];
}
