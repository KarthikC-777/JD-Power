import { Controller, Get, Param, Render, Res } from '@nestjs/common';
import { AutoDataService } from './auto-data.service';
@Controller('vehicle-info')
export class AutoDataController {
  constructor(private autodtaService: AutoDataService) {}

  @Get('vin/:vin')
  @Render('index')
  async getVehicleDetailsByVin(@Param('vin') vin: string) {
    const result = await this.autodtaService.getVehicleDetailsByVin(vin);
    return {
      vin: result.vin,
      year: result.year,
      make: result.make,
      model: result.model,
      trim: result.trim,
      color: result.color,
      colorHex: result.colorHex,
      styleId: result.styleId,
    };
  }
}
