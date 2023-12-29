import { IsJWT, IsString } from 'class-validator';

export class VerifyTokenDTO {
  @IsJWT()
  @IsString()
  token: string;
}
