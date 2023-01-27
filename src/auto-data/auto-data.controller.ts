import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { validateVin } from 'src/util/validators';
import { AutoDataService } from './auto-data.service';

@Controller('vehicle-info')
export class AutoDataController {
  constructor(private autodataService: AutoDataService) {}

  @Get('vin/:vin')
  async getVehicleDetailsByVin(@Param('vin') vin: string) {
    const valid = validateVin(vin);
    if (valid) {
      return await this.autodataService.getVehicleDetailsByVin(vin);
    }
    throw new HttpException('Invalid Vin', HttpStatus.BAD_REQUEST);
  }
  @Get('report/:vin')
  async getVehicleDetailsReportByVin(@Param('vin') vin: string) {
    const valid = validateVin(vin);
    if (valid) {
      return await this.autodataService.generateReport(vin);
    }
    throw new HttpException('Invalid Vin', HttpStatus.BAD_REQUEST);
  }
}
