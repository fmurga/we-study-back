import { IsUUID } from 'class-validator';

export class CreateUserFollowDto {
  @IsUUID()
  followingId: string;
}
