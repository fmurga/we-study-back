import { IsString, IsUUID, MinLength } from 'class-validator';

export class NewMessageDto {
  @IsString()
  @MinLength(1)
  message: string;

  @IsString()
  @IsUUID()
  lessonId: string;
}
