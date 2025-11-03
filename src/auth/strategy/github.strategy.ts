import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
      scope: ['user:email', 'read:user', 'write:repo_hook', 'repo'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ) {
    const { username, emails } = profile;
    const user = {
      email: emails[0].value,
      userName: username,
      githubAccessToken: accessToken,
    };
    done(null, user);
  }
}
