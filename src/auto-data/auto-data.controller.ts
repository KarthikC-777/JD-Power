import { Controller, Get, Param } from '@nestjs/common';
import { AutoDataService } from './auto-data.service';

@Controller('vehicle-info')
export class AutoDataController {
  constructor(private autodtaService: AutoDataService) {}

  @Get('vin/:vin')
  async getVehicleDetailsByVin(@Param('vin') vin: string) {
    return await this.autodtaService.getVehicleDetailsByVin(vin);
  }
}
