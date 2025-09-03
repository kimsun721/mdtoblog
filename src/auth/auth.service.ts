import * as CryptoJS from 'crypto-js';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthResponseDto } from 'src/auth/dto/auth-response.dto';
import { ConfigService } from '@nestjs/config';
import { OauthLoginDto } from './dto/oauth-login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async oauthLogin(dto: OauthLoginDto): Promise<AuthResponseDto> {
    const { email, userName, githubAccessToken } = dto;
    console.log(dto);
    const user = await this.userRepository.findOneBy({ email });

    const res = await this.userSave(email, userName, githubAccessToken);
    if (!res) {
      throw new BadRequestException('USER_SAVE_ERROR');
    }

    let userId;
    if (user) {
      userId = user.id;
    } else {
      userId = res.id;
    }

    const payload = {
      userId,
      email,
      userName,
    };

    const token = this.jwtService.sign(payload); // .env에 expires in 들어있음

    return {
      success: true,
      accessToken: token,
    };
  }
  async userSave(email: string, username: string, accessToken: string) {
    const secretKey = await this.configService.get<string>('JWTKEY');

    const encryptedToken = CryptoJS.AES.encrypt(
      accessToken,
      secretKey,
    ).toString();

    const result = await this.userRepository.save({
      email,
      username,
      access_token: encryptedToken,
    });

    return result;
  }
}
