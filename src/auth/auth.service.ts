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
        private readonly UserRepository : Repository<User>,
        private readonly jwtService : JwtService
    ){}
    async register(RegisterDto : RegisterDto): Promise<{success:boolean}> {
        const { email , username , password } = RegisterDto

        if (!await this.isEmailTaken(email)) {
            throw new BadRequestException("이메일 중복");
        }

        if (!await this.isUsernameTaken(username)) {
            throw new BadRequestException("유저네임 중복");
        }

        try {

            const hashedPassword = await bcrypt.hash(password,10)

            await this.UserRepository.save
            ({
                email:email,
                username:username,
                password:hashedPassword
            });

            return {
                "success":true
            };

        } catch(err) {
            console.log(err);
            throw new InternalServerErrorException()
        }
    
        
    }

    async isEmailTaken(email : string): Promise<boolean> {
        try {
            const res = await this.UserRepository.findOne({
                 where : { email : email }
                });

            return !res;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async isUsernameTaken(username : string): Promise<boolean> {
        try {
            const res = await this.UserRepository.findOne({
                 where : { username : username }});
            return !res;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async login(LoginDto : LoginDto): Promise<{success:boolean , accessToken:string}> {
        const {email,username,password} = LoginDto;

        if (!email && !username) {
            throw new BadRequestException("이메일또는 유저네임 중 하나는 필수입니다.");
        }

        if (!password) {
            throw new BadRequestException("비밀번호는 필수입니다.");
        }

        let user;

        if(email) {
            user = await this.UserRepository.findOne({ where : {email:email}})
        } else {
            user = await this.UserRepository.findOne({ where : {username:username}})
        }

        if(!user) throw new UnauthorizedException("해당 유저가 존재하지 않습니다.");

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect) {
            throw new UnauthorizedException("비밀번호가 틀렸습니다.");
        }
        
        const token = this.jwtService.sign({email,username})

        return {
            "success":true,
            "accessToken":token
        }
    }
}
