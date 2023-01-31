import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IVehicleDetailsByVinResponse } from 'src/dto/IVehicleDetailByVin.dto';
import { VehicleInfoDBInfo } from 'src/dto/VehicleInfoDBInfo.dto';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as CryptoJS from 'crypto-js';
import axios from 'axios';
import * as suid from 'suid';
import { ConfigService } from '@nestjs/config';
import { logger } from 'src/config/logger';

interface IAnyObject {
  [key: string]: any;
}

@Injectable()
export class AutoDataService {
  constructor(private configService: ConfigService) {}
  async getVehicleDetailsByVin(vin: string) {
    return await this.getVehicleByVin(vin);
  }

  private generateSecretDigest = (
    nonce: string,
    timestamp: number,
    appSecret: string,
  ) => {
    const baseString = nonce + timestamp.toString() + appSecret;
    return CryptoJS.SHA1(baseString).toString(CryptoJS.enc.Base64);
  };

  private generateAutoDataToken = (
    realm: string,
    appId: string,
    nonce: string,
    secretDigest: string,
    timestamp: number,
  ) => {
    return `${this.configService.get<string>(
      'JD_POWER_CONSTANTS.autodata_name',
    )} realm="${realm}",chromedata_app_id="${appId}",chromedata_nonce="${nonce}",chromedata_secret_digest="${secretDigest}",chromedata_digest_method="SHA1",chromedata_version="1.0",chromedata_timestamp="${timestamp}"`;
  };

  private getAutoDataInformation = async (vin: string): Promise<VehicleInfoDBInfo> => {
    const realm = this.configService.get<string>(
      'JD_POWER_CONSTANTS.autodata_realm',
    );
    const appId = this.configService.get<string>('appId');
    const appSecret = this.configService.get<string>('appSecret');
    const timestamp = Date.now();
    const nonce = suid.better();
    const secretDigest = this.generateSecretDigest(nonce, timestamp, appSecret);
    const token = this.generateAutoDataToken(
      realm,
      appId,
      nonce,
      secretDigest,
      timestamp,
    );
    const endpoint = `${this.configService.get<string>(
      'JD_POWER_CONSTANTS.autodata_api_url',
    )}/vin/${vin}?language_Locale=${this.configService.get<string>(
      'autodata_language',
    )}`;
    const config = {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };
    logger.log('Fetching the VIN description from AutoData API');
    const response = await axios(endpoint, config);
    logger.log("Autodata API Response",response);

    // Invalid response payload if error is true or result object is undefined
    if (response.data?.error || !response.data?.result) {
      logger.error('Invalid response payload');
      throw new HttpException(
        'Invalid response payload/ Invalid VIN',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (response.data.result.validVin) {
      return response.data.result;
    }
  };

  private getVehicleByVin = async (
    vin: string,
  ): Promise<IVehicleDetailsByVinResponse> => {
    const results = await this.getAutoDataInformation(vin);
    logger.log(`getAutoDataInformation - results - ${results}`);
    
    // Avoid unexpected errors when trying to access to object members
    // by using a default data structure `[]` in this case:
    const vehicles = results.vehicles ?? [];
    const exteriorColors = results.exteriorColors ?? [];

    const details = {
      vin,
      year: isNaN(+results.year) ? undefined : +results.year,
      make: results.make,
      model: results.model,
      trim: vehicles[0]?.trim,
      color: exteriorColors[0]?.genericDesc,
      colorHex: exteriorColors[0]?.rgbHexValue ?? '',
      styleId: vehicles[0]?.styleId ?? '',
    };

    logger.log(`Valid VIN received, vehicle details - ${details}`);

    return details;
  }

  private checkIfArrayContainsObjects = (data: Array<IAnyObject>) => { 
    if (Array.isArray(data)) {
      if (typeof data[0] === 'object') {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }
  
  private checkIfArrayLengthIsOne = (data: IAnyObject) =>  {
    return Array.isArray(data) && data.length === 1;
  }
  
  private buildHeader = (data: Array<IAnyObject>): string[] => {
    const columnSet = new Set<string>();
    if (!this.checkIfArrayContainsObjects(data)) {
      return [];
    }
    data.forEach((column) => {
      Object.keys(column).forEach((key: string) => columnSet.add(key));
    });
    return Array.from(columnSet);
  }
  private getSimplifiedRow = (row: any) => {
    let stringifiedRow;
    if (typeof row == 'object') {
      if (!this.checkIfArrayContainsObjects(row)) {
        stringifiedRow = row.toString();
      } else {
        stringifiedRow = JSON.stringify(
          this.checkIfArrayLengthIsOne(row) ? row[0] : row,
        );
      }
    } else {
      stringifiedRow = row;
    }
    return stringifiedRow ? stringifiedRow : '';
  }
  private buildBody = (data: Array<IAnyObject>): string[][] => {
    const res = [];
    let row: Array<IAnyObject> = [];
    const table_columns = this.buildHeader(data);
    const isArrayOfObjects = this.checkIfArrayContainsObjects(data);
    if (isArrayOfObjects) {
      data.forEach((header) => {
        table_columns.forEach((col) => {
          row.push(this.getSimplifiedRow(header[col]));
        });
        res.push(row);
        row = [];
      });
    } else {
      row = data.map((d) => [d]);
      res.push(row);
    }
    return res;
  }
  
  private getOverallDetailsTableBody = (data: IAnyObject)=>  {
    const rows = [];
    for (const key in data) {
      if (typeof data[key] !== 'object') {
        rows.push([key, data[key]]);
      }
    }
    return rows;
  }
  
  private getTableHeaders = (data: IAnyObject) => {
    const rows = [];
    for (const key in data) {
      if (typeof data[key] === 'object') {
        rows.push(key);
      }
    }
    return rows;
  }
  
  private generatePdf = (data: IAnyObject, pdfHeading = 'Report') => {
    const doc = new jsPDF({ orientation: 'landscape' });
    try {
      logger.log('Generating PDF Report');
      autoTable(doc, {
        head: [
          [{ content: pdfHeading.toUpperCase(), styles: { fillColor: 'green' } }],
        ],
      });
  
      autoTable(doc, {
        body: this.getOverallDetailsTableBody(data),
      });
      const headers = this.getTableHeaders(data);
      for (let i = 0; i < headers.length; i++) {
        const styles: any = {
          overflow: 'line-break',
          cellPadding: 1,
          fontSize: 5,
        };
        let columnStyles;
        const table_headers = this.buildHeader(data[headers[i]]);
        if (table_headers.length < 10) {
          styles.fontSize = 5;
          styles.cellWidth = 'wrap';
        } else {
          columnStyles = {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 20 },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 'auto' },
            4: { cellWidth: 25 },
            5: { cellWidth: 35 },
            6: { cellWidth: 30 },
            7: { cellWidth: 25 },
            8: { cellWidth: 'auto' },
            9: { cellWidth: 20 },
          };
        }
        autoTable(doc, {
          head: [
            [
              {
                content: headers[i].toUpperCase(),
                styles: { fillColor: 'green' },
              },
            ],
          ],
        });
        autoTable(doc, {
          head: table_headers.length > 0 ? [table_headers] : undefined,
          body: this.buildBody(data[headers[i]]),
          styles,
          columnStyles: columnStyles
            ? columnStyles
            : { text: { cellWidth: 'auto' } },
        });
      }
      return doc.output();
    } catch (err) {
      logger.error('Error occurred while generating pdf from JSON', err);
      throw new HttpException('Could not generate pdf!!',HttpStatus.INTERNAL_SERVER_ERROR)
      
    }
  }
  generateReport = async (
    vin: string,
  ): Promise<any> => {
    const result = await this.getAutoDataInformation(vin)
    return this.generatePdf(result);
  }
}
