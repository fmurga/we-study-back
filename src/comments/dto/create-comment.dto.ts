import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  postId: string;

  @IsOptional()
  @IsUUID()
  parentCommentId?: string;
}
