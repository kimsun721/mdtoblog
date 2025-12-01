import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OauthLoginDto } from './dto/login.dto';
import { plainToInstance } from 'class-transformer';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(AuthGuard('github'))
  @Get('github')
  async githubLogin() {}

  @UseGuards(AuthGuard('github'))
  @Get('github/redirect')
  async githubRedirect(@Req() req, @Res({ passthrough: true }) res: Response) {
    const dto = plainToInstance(OauthLoginDto, req.user);
    const result = await this.authService.oauthLogin(dto);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      // domain: '.cloudtype.app',
      maxAge: 1000 * 60 * 60 * 24 * 30,
      path: '/',
    });

    const front = this.configService.get('FRONT_URL');
    res.redirect(front);
  }

  @Post('refresh')
  async refreshAccess(@Req() req) {
    const cookie: string = req.headers.cookie;
    const refreshToken = cookie
      ?.split(';')
      .map((v) => v.trim())
      .find((v) => v.startsWith('refreshToken='))
      ?.split('=')[1];

    if (!refreshToken) {
      throw new UnauthorizedException('No token');
    }

    const res = await this.authService.refresh(refreshToken);
    return res;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req) {
    await this.authService.logout(req.user.profile.userId);
    return;
  }
}
