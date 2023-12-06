import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { Post } from 'src/posts/entities/post.entity';

export class CreateTagDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  @IsOptional()
  slug?: string;

  @IsIn(['active', 'down'])
  @IsOptional()
  status?: string;

  @ApiProperty({ example: [{ id: 1 }, { id: 2 }] })
  readonly posts: Post[];
}
