import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import * as CryptoJS from 'crypto-js';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CommonService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  public header(token: string) {
    return {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    };
  }

  async tokenDecrypt(userId: number): Promise<string> {
    const secretKey = this.configService.get<string>('CRYPTO_SECRET');

    const res = await this.userRepository.findOneBy({ id: userId });

    if (!res) {
      throw new ForbiddenException('토큰 정보가 올바르지 않습니다');
    }

    const bytes = CryptoJS.AES.decrypt(res?.access_token, secretKey);
    const token = bytes.toString(CryptoJS.enc.Utf8);

    return token;
  }
}
