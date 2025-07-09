import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports:[
        TypeOrmModule.forFeature([User]),
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService : ConfigService)=> ({
                secret: configService.get<string>('JWTKEY'),
                signOptions: {expiresIn:'231786d'} // 1시간뒤 토큰 만료
            })
        })
    ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
