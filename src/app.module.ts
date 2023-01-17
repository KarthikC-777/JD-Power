import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AutoDataModule } from './auto-data/auto-data.module';
import configuration from './config/configuration';

@Module({
  imports: [
    AutoDataModule,
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
