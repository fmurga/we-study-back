import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateTagDto {
  @IsString()
  title: string;
  @IsOptional()
  @IsString()
  slug?: string;
  @IsOptional()
  @IsIn(['active', 'down'])
  status?: string;
}
