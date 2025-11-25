import { Module } from '@nestjs/common';
import config from './config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'production' ? undefined : '.env',
      isGlobal: true,
      load: [config],
      ignoreEnvFile: true,
    }),
  ],
})
export class ConfigurationModule {}
