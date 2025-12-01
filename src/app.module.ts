import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { JwtStrategy } from './auth/strategy/jwt.strategy';
import { GithubStrategy } from './auth/strategy/github.strategy';
import { RepoModule } from './repo/repo.module';
import { PostModule } from './post/post.module';
import { CommonModule } from './common/common.module';
import { CommentModule } from './comment/comment.module';
import { ScheduleModule } from '@nestjs/schedule';
import { LikeModule } from './like/like.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity.{js,ts}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     uri: configService.get<string>('MONGO_URL'),
    //   }),
    // }),
    AppModule,
    AuthModule,
    UserModule,
    RepoModule,
    PostModule,
    CommonModule,
    CommentModule,
    LikeModule,
  ],
  controllers: [],
  providers: [
    ConfigService,
    JwtStrategy,
    GithubStrategy,
    // {
    //   provide:APP_GUARD,
    //   useClass: AuthGuard('jwt')
    // }
  ],
})
export class AppModule {}
