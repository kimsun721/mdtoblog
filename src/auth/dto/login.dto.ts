import { IsEmail, IsString } from 'class-validator';

export class OauthLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  userName: string;

  @IsString()
  githubAccessToken: string;
}
