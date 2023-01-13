import { Module } from '@nestjs/common';
import { AutoDataModule } from './auto-data/auto-data.module';

@Module({
  imports: [AutoDataModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
