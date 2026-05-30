import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ReportType } from '@prisma/client';

export class CreateReportDto {
  @IsEnum(ReportType)
  reportType: ReportType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  postId?: string;

  @IsUUID()
  @IsOptional()
  commentId?: string;
}
