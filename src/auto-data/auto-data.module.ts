import { Module } from '@nestjs/common';
import { AutoDataService } from './auto-data.service';
import { AutoDataController } from './auto-data.controller';

@Module({
  providers: [AutoDataService],
  controllers: [AutoDataController]
})
export class AutoDataModule {}
