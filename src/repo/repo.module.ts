import { Module } from '@nestjs/common';
import { RepoService } from './repo.service';
import { RepoController } from './repo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repo } from 'src/entities/repo.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([User,Repo]),
  ],
  controllers: [RepoController],
  providers: [RepoService],
})
export class RepoModule {}
