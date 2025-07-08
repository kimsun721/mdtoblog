import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from "bcrypt";
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository : Repository<User>,
        private readonly jwtService : JwtService
    ){}
    async register(registerDto : RegisterDto): Promise<{success:boolean}> {
        const { email , username , password } = registerDto

        if (await this.isFieldTaken('email',email)) {
            throw new BadRequestException("이메일 중복");
        }

        if (await this.isFieldTaken('username',username)) {
            throw new BadRequestException("유저네임 중복");
        }

        try {

            const hashedPassword = await bcrypt.hash(password,10)

            await this.userRepository.save({
                email,
                username,
                hashedPassword
            });

            return {
                success:true
            };

        } catch(err) {
            console.log(err);
            throw new InternalServerErrorException()
        }
    
        
    }

    async isFieldTaken(field: keyof User,value: string) {
        try {
            const res = await this.userRepository.findOne({
                 where : { [field] : value }});
            return !!res;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async login(loginDto : LoginDto): Promise<{success:boolean , accessToken:string}> {
        const {email,username,password} = loginDto;

        if (!email && !username) {
            throw new BadRequestException("이메일또는 유저네임 중 하나는 필수입니다.");
        }

        if (!password) {
            throw new BadRequestException("비밀번호는 필수입니다.");
        }

        let user;

        if(email) {
            user = await this.userRepository.findOne({ where : {email:email}})
        } else {
            user = await this.userRepository.findOne({ where : {username:username}})
        }

        if(!user) throw new UnauthorizedException("로그인 정보가 올바르지 않습니다.");

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect) {
            throw new UnauthorizedException("로그인 정보가 올바르지 않습니다.");
        }

        const payload = {
            userId:user.user_id,
            email:user.email,
            username:user.username
        }
        
        const token = this.jwtService.sign(payload)

        return {
            success:true,
            accessToken:token
        }
    }
}


