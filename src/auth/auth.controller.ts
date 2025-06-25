import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Body, Controller, Post } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

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
    async Login(@Body() body:RegisterDto) {
        const res = await this.authService.login(body);

        return res;
    }
}
