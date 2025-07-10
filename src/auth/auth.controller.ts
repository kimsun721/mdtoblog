import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService:AuthService
    ) {};

    @Post("register")
    @ApiOperation({ summary: '회원가입', description: '회원가입' })
    @ApiResponse({ status: 201, description: '회원가입 성공' })
    async Register(@Body() body:RegisterDto) {
        const res = await this.authService.register(body);
        
        return res;
    }

    @Post("login")
    @ApiOperation({ summary: '로그인', description: '로그인' })
    @ApiResponse({ status: 200, description: '로그인 성공' })
    async Login(@Body() body:LoginDto) {
        const res = await this.authService.login(body);

        return res;
    }   

    @UseGuards(AuthGuard('google'))
    @Get('google/redirect')
    async googleAuthRedirect(@Req() req) {
        return await this.authService.oauthLogin(req.user.email,req.user.name);
    }
}
