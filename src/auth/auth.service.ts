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

    return {
      success: true,
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
    };
  }

  async userSave(email: string, userName: string, githubAccessToken: string) {
    const user = await this.userRepository.findOneBy({ email });
    const secretKey = await this.configService.get<string>('CRYPTO_SECRET');
    const encryptedToken = CryptoJS.AES.encrypt(githubAccessToken, secretKey).toString();

    if (user) {
      const payload = {
        userId: user?.id,
        email,
        userName,
        githubId: user?.githubId,
      };
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });
      const accessToken = this.jwtService.sign(payload, { expiresIn: '10m' });

      await this.userRepository.update(
        { id: user.id },
        { githubAccessToken: encryptedToken, refreshToken },
      );
      return { accessToken, refreshToken };
    }

    const url = `https://api.github.com/users/${userName}`;
    const res = await axios.get(url, {});

    const result = await this.userRepository.save({
      email,
      userName,
      githubId: res.data.id,
      githubAccessToken: encryptedToken,
    });

    const payload = {
      userId: result.id,
      email,
      userName,
      githubId: res.data.id,
    };
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });
    const accessToken = this.jwtService.sign(payload, { expiresIn: '10m' });
    await this.userRepository.update({ id: result.id }, { refreshToken });

    return { accessToken, refreshToken };
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

  async refresh(refreshToken: string) {
    const user = await this.userRepository.findOne({ where: { refreshToken } });
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    const r = await this.jwtService.decode(refreshToken);
    const expiredDate = new Date(r.exp * 1000);
    if (new Date() > expiredDate) {
      await this.userRepository.update({ id: user.id }, { refreshToken: null });

      throw new UnauthorizedException('Invaild token');
    }

    const payload = {
      userId: user.id,
      email: user.email,
      userName: user.userName,
      githubId: user.githubId,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '10m' });

    return accessToken;
  }
}
