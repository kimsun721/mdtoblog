import * as CryptoJS from 'crypto-js';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthResponseDto } from 'src/auth/dto/auth-response.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async oauthLogin(
    email: string,
    username: string,
    accessToken: string,
  ): Promise<AuthResponseDto> {
    const user = await this.userRepository.findOneBy({ email });

    let userId;
    let res;

    if (user) {
      userId = user.id;
      try {
        res = await this.userSave(email, username, accessToken);
      } catch (e) {
        console.log(e);
        throw new InternalServerErrorException('USER_SAVE_ERROR', e);
      }
    } else {
      try {
        res = await this.userSave(email, username, accessToken);
      } catch (e) {
        console.log(e);
        throw new InternalServerErrorException('USER_SAVE_ERROR');
      }
      userId = res.id;
    }

    const payload = {
      userId,
      email,
      username,
    };

    const token = this.jwtService.sign(payload); // .env에 expires in 들어있음

    return {
      success: true,
      accessToken: token,
    };
  }
  async userSave(email: string, username: string, accessToken: string) {
    const secretKey = await this.configService.get<string>('CRYPTO_SECRET');

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
