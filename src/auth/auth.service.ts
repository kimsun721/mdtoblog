import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    async register(RegisterDto) {
        // const {}
    }
    async login(LoginDto) {
        
    }
}
