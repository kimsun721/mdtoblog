import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';

// TODO 
// - 로그인,구글 로그인 코드부분 좀 더 함수로 묶고 해서 최적화하기
// - 구글 로그인 코드 괄호가 너무 많음 + 변수명 대충지음  
// - dto 안쓴부분 고치기

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository : Repository<User>,
        private readonly jwtService : JwtService
    ){}

    async oauthLogin(email : string, username : string): Promise<{success:boolean,accessToken:string}> {
        const res = await this.userRepository.findOne({ where : { email:email}})
        if(!res) {
            try {

                const rres = await this.userRepository.save({
                    email,
                    username
                });

                const userId = rres.id

                const payload = {
                    userId,
                    email,
                    username
                }

                const token = this.jwtService.sign(payload)

                return {
                    success:true,
                    accessToken:token
                }
            } catch(err) {
                console.log(err.message)
                throw new BadRequestException();
            }
        } else {
            const rres = await this.userRepository.findOne({
                where:{
                    email,
                }
            })

            const userId = rres?.id

            const payload = {
                userId,
                email,
                username
            }

            const token = this.jwtService.sign(payload)

            return {
                success:true,
                accessToken:token
            }
        }
    }
}


