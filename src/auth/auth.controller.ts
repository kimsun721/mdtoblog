import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OauthLoginDto } from './dto/oauth-login.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @UseGuards(AuthGuard('github'))
  @Get('github')
  async githubLogin() {}

  @UseGuards(AuthGuard('github'))
  @Get('github/redirect')
  @ApiOperation({
    summary: 'github 로그인',
    description: 'github oauth 로그인',
  })
  async githubRedirect(@Req() req) {
    console.log(req);
    const dto = plainToInstance(OauthLoginDto, req.user);
    return await this.authService.oauthLogin(dto);
  }
}
