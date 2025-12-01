import * as CryptoJS from 'crypto-js';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthResponseDto } from 'src/auth/dto/auth-response.dto';
import { ConfigService } from '@nestjs/config';
import { OauthLoginDto } from './dto/login.dto';
import axios from 'axios';
import { RefreshToken } from './entity/refresh-token.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async oauthLogin(dto: OauthLoginDto): Promise<AuthResponseDto> {
    const { email, userName, githubAccessToken } = dto;

    const res = await this.userSave(email, userName, githubAccessToken);

    return {
      success: true,
      accessToken: res.accessToken,
      uuid: res.uuid,
    };
  }

  async userSave(email: string, userName: string, githubAccessToken: string) {
    const user = await this.userRepository.findOneBy({ email });
    const secretKey = await this.configService.get<string>('CRYPTO_SECRET');
    const encryptedToken = CryptoJS.AES.encrypt(githubAccessToken, secretKey).toString();
    const uuid = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

    if (user) {
      const payload = {
        userId: user?.id,
        email,
        userName,
        githubId: user?.githubId,
      };
      const accessToken = this.jwtService.sign(payload, { expiresIn: '10m' });

      await this.userRepository.update({ id: user.id }, { githubAccessToken: encryptedToken });

      const refreshToken = await this.refreshTokenRepository.update(
        { user },
        {
          uuid,
          expiresAt: new Date(),
        },
      );

      return { accessToken, uuid };
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
    const accessToken = this.jwtService.sign(payload, { expiresIn: '10m' });
    const refreshToken = await this.refreshTokenRepository.save({
      user: result,
      uuid,
      expiresAt,
    });

    return { accessToken, uuid };
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

  async refresh(uuid: string) {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { uuid },
      relations: ['user'],
    });
    if (!refreshToken) {
      throw new UnauthorizedException('Invalid uuid');
    }

    if (new Date() > refreshToken.expiresAt) {
      await this.refreshTokenRepository.delete({ uuid });

      throw new UnauthorizedException('Invaild token');
    }

    const payload = {
      userId: refreshToken.user.id,
      email: refreshToken.user.email,
      userName: refreshToken.user.userName,
      githubId: refreshToken.user.githubId,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '10m' });

    return accessToken;
  }

  async logout(userId: number) {
    await this.refreshTokenRepository.delete({ user: { id: userId } });
  }
}
