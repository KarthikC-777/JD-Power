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
  constructor(private autodtaService: AutoDataService) {}

  @Get('vin/:vin')
  async getVehicleDetailsByVin(@Param('vin') vin: string) {
    const valid = validateVin(vin);
    if (valid) {
      return await this.autodtaService.getVehicleDetailsByVin(vin);
    }
    throw new HttpException('Invalid Vin', HttpStatus.BAD_REQUEST);
  }
}
