import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { ConfigurationModule } from 'src/config/configuration.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ConfigurationModule],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
