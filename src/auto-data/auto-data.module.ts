import { Module } from '@nestjs/common';
import { AutoDataService } from './auto-data.service';
import { AutoDataController } from './auto-data.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [AutoDataService],
  controllers: [AutoDataController],
})
export class AutoDataModule {}
