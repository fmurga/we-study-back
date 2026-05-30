import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export enum EventType {
  LESSON = 'LESSON',
  EXAM = 'EXAM',
  ASSIGNMENT = 'ASSIGNMENT',
  STUDY_SESSION = 'STUDY_SESSION',
  MEETING = 'MEETING',
  OTHER = 'OTHER',
}

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(EventType)
  @IsOptional()
  eventType?: EventType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsBoolean()
  @IsOptional()
  isAllDay?: boolean;

  @IsBoolean()
  @IsOptional()
  hasReminder?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  reminderMinutes?: number;
}
