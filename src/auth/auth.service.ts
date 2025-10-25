import * as CryptoJS from 'crypto-js';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthResponseDto } from 'src/auth/dto/auth-response.dto';
import { ConfigService } from '@nestjs/config';
import { OauthLoginDto } from './dto/oauth-login.dto';
import axios from 'axios';
import { loginCheckDto } from './dto/login-check.dto';

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

    const res = await this.userSave(email, userName, githubAccessToken);
    const userId = res.id;
    const githubId = res.githubId;

    const payload = {
      userId,
      email,
      userName,
      githubId,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '30d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '10m' });
    return {
      success: true,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async userSave(email: string, userName: string, githubAccessToken: string) {
    const user = await this.userRepository.findOneBy({ email });

    const secretKey = await this.configService.get<string>('CRYPTO_SECRET');

    const encryptedToken = CryptoJS.AES.encrypt(githubAccessToken, secretKey).toString();

    if (user) {
      await this.userRepository.update(
        { id: user.id },
        { githubAccessToken: encryptedToken },
      );
      return user;
    }

    const url = `https://api.github.com/users/${userName}`;
    const res = await axios.get(url, {});

    const result = await this.userRepository.save({
      email,
      userName,
      githubId: res.data.id,
      githubAccessToken: encryptedToken,
    });

    return result;
  }

  // async loginCheck(dto: loginCheckDto) {
  //   const { userId } = dto;
  //   const githubId = await this.userRepository.findOne({
  //     where: { id: userId },
  //     select: ['githubId'],
  //   });

  //   if (!githubId) {
  //     throw new UnauthorizedException();
  //   }

  //   return githubId;
  // }

  async refresh() {}
}
