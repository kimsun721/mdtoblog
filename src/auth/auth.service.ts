import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { AuthResponseDto } from 'src/dto/ResponseDto/AuthResponseDto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository : Repository<User>,
        private readonly jwtService : JwtService
    ){}

    async oauthLogin(email : string, username : string, accessToken : string): Promise<AuthResponseDto> {
        const user = await this.userRepository.findOneBy({ email });
        
        let userId
        let res

        if(user) {
            userId = user.id
            await this.userSave(email,username,accessToken)
        } else {
            try {
                res = await this.userSave(email,username,accessToken);
            } catch (e) {
                throw new InternalServerErrorException('USER_SAVE_ERROR');
            }
            userId = res.id
        }

        const payload = {
            userId,
            email,
            username
        }

        const token = this.jwtService.sign(payload) // .env에 expires in 들어있음

        return {
            success:true,
            accessToken:token
        }  
    }
    async userSave(email : string, username : string, accessToken : string) {
        
        const hashedAccessToken = await bcrypt.hash(accessToken,10)
        console.log(hashedAccessToken)
        
        const result = await this.userRepository.save({
            email,
            username,
            access_token:hashedAccessToken
        });

        return result;
    }
}


