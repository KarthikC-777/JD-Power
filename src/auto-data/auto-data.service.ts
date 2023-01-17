import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IVehicleDetailsByVinResponse } from 'src/dto/IVehicleDetailByVin.dto';
import { VehicleInfoDBInfo } from 'src/dto/VehicleInfoDBInfo.dto';

import * as CryptoJS from 'crypto-js';
import axios from 'axios';
import * as suid from 'suid'

@Injectable()
export class AutoDataService {
  async getVehicleDetailsByVin(vin: string) {
    try {
      return await this.getVehicleByVin(vin);
    } catch (err) {
      console.log(err);
      throw new HttpException('Vehicle with this VIN Not Found',HttpStatus.NOT_FOUND)
      
    }
  }
  getAutoDataInformation = async (vin: string): Promise<VehicleInfoDBInfo> => {
    try {
      const realm = 'http://communitymanager';
      const appId = 'autodata-GCSZuViifCnPSkk4y5BTwXBDPYiUaP7Q4hiEL8aX';
      const appSecret =
        '9990d848bac60312010d5d79fd5580a7c35e7dde7bfe71c0a44976bc3ea03012';
      const timestamp = Date.now();

      const nonce = suid.better();
      // const nonce = 'pkWMcJGrsMjcyLaTCwekao';

      const baseString = nonce + timestamp.toString() + appSecret;

      const secretDigest = CryptoJS.SHA1(baseString).toString(
        CryptoJS.enc.Base64,
      );
      const token = `Atmosphere realm="${realm}",chromedata_app_id="${appId}",chromedata_nonce="${nonce}",chromedata_secret_digest="${secretDigest}",chromedata_digest_method="SHA1",chromedata_version="1.0",chromedata_timestamp="${timestamp}"`;
      console.log(token);
      const endpoint = `https://cvd.api.chromedata.com:443/v1.0/CVD/vin/${vin}?language_Locale=en_US`;
      const config = {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: token,
        },
      };

      console.log('fetching the VIN description from AutoData API');
      const response: any = await axios(endpoint, config);
      console.log(response);

      // Invalid response payload if error is true or result object is undefined
      if (response.data?.error || !response.data?.result) {
        console.log('Invalid response payload');
        throw new HttpException('Invalid response payload/ Invalid VIN', HttpStatus.BAD_REQUEST)
      }

      if (response.data.result.validVin) {
        return response.data.result;
      }
      console.log('Invalid VIN');
      throw new HttpException('Invalid VIN', HttpStatus.BAD_REQUEST)
      
    } catch (err) {
      console.log(err);
      throw new HttpException(err.response, err.status);
    }
  };

  getVehicleByVin = async (
    vin: string,
  ): Promise<IVehicleDetailsByVinResponse> => {
    try {
      const results = await this.getAutoDataInformation(vin);
      console.log(results, 'getAutoDataInformation - results');

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

      console.log(details, 'Valid VIN received, vehicle details');

      return details;
    } catch(err) {
      throw new HttpException(err.message,err.status)
    }

    //     const generateSecretDigest = (
    //       nonce: string,
    //       timestamp: number,
    //       appSecret: string,
    //     ) => {
    //       const baseString = nonce + timestamp.toString() + appSecret;
    //       return CryptoJS.SHA1(baseString).toString(CryptoJS.enc.Base64);
    //     };

    //     const generateAutoDataToken = (
    //       realm: string,
    //       appId: string,
    //       nonce: string,
    //       secretDigest: string,
    //       timestamp: number,
    //     ) => {
    //       return `http://communitymanager realm="${realm}",chromedata_app_id="${appId}",chromedata_nonce="${nonce}",chromedata_secret_digest="${secretDigest}",chromedata_digest_method="SHA1",chromedata_version="1.0",chromedata_timestamp="${timestamp}"`;
    //     };
  };
}
