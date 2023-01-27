<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

Fetching all details about a vehicle using VIN (Vehicle Identification Number) And generating a PDF report using JD Power

## Setting Up

Make **.env** file in your project and initialize all the variables as per **.env.example** variables.

Then initialize the _controllers_ and _services_ from the **autodata.module.ts** file via the factory methods _serviceFactory_(for services) and controllerFactory (for controllers). 

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```


# Getting Started - ChromeData (AutoData API)

This document highlights the steps involved in getting started with ChromeData (AutoData API).

## Setup

- Signup and Login for [AutoData API](https://portal.chromedata.com/enterpriseapi/#/home/login)
- Create the App under “Apps”
- Copy the “appId” and “appSecret”

## VIN Description API

This API is used to fetch the vehicle content information based on the VIN.

- Under “APIs → All APIs → ChromeData VIN Descriptions”
- Click on “Documentation → API Reference”
- Try out the below API - “getVinDescription****”**** in the playground.

`GET /vin/{vin} - Returns vehicle content for the requested vehicle.`

- Click on “Setup” and ensure that the auto-filled “appId” and “appSecret” are proper. Click on “Save”.
- Provide “Accept” as “application/json”.
- Provide “language_local” as “en_US”.
- Provide “vin” value.
- Click on “Security”, verify each step, proceed and “Finish”.
- Click on “Invoke”.
- Verify the response received from the API.

## Integration

API Endpoint Sample - `https://cvd.api.chromedata.com:443/1.0/CVD/vin/${vin}?language_Locale=en_US`

Headers:

- Accept: `application/json`
- Content-Type: `application/json`
- Authorization: `Token` ([Generation Steps](https://www.notion.so/Getting-Started-ChromeData-AutoData-API-e46b38caf414459489081c8a38fb5636))

**Authorization Token Generation**

At a high level, the token is built using a comma delimited list of name value pairs. The name fields that need to be set are -

- realm - Identifies that the message comes from the realm of your app
- chromedata_app_id - App ID
- chromedata_nonce - A random string uniquely generated for each request
- chromedata_signature_method - A value indicating the signature method being used. Should be set to “SHA1”.
- chromedata_timestamp - The timestamp of the request, expressed as the number of milliseconds
- chromedata_secret_digest - A value produced by concatenating the nonce, the timestamp, and the Shared Secret, hashing the combined value using SHA-1, and then Base-64 encoding the result. You can also URL-encode the result, but this isn't required.

**chromedata_secret_digest generation sample code:**

`const baseString = nonce + timestamp.toString() + appSecret;
return CryptoJS.SHA1(baseString).toString(CryptoJS.enc.Base64);`

**Token generation sample code**

`return Atmosphere realm="${realm}",chromedata_app_id="${appId}",chromedata_nonce="${nonce}",chromedata_secret_digest="${secretDigest}",chromedata_digest_method="SHA1",chromedata_version="1.0",chromedata_timestamp="${timestamp}"`;


## Request:

GET: 'http://{host}/vehicle-info/vin/${vin}'

We need to pass the vehicle identification number as the parameter in the above URL.

GET: 'http://{host}/vehicle-info/report/${vin}'

We need to pass the vehicle identification number as the parameter in the above URL.

## Response:

```json
{
    "vin": "4JGFD8KB5PA893908",
    "year": 2023,
    "make": "Mercedes-Benz",
    "model": "AMG GLE 63 Coupe",
    "trim": "S 4MATIC",
    "color": "Black",
    "colorHex": "#0A0A0C",
    "styleId": 432764
}
```

The other response will be an entire report about the vehicle in PDF Format


## References:

JD Power documentation: https://www.notion.so/Getting-Started-ChromeData-AutoData-API-e46b38caf414459489081c8a38fb5636

Nestjs documentation: https://docs.nestjs.com/

jsPDF documentation: https://artskydj.github.io/jsPDF/docs/jsPDF.html

## Contact for more info:-

1. Arindam Nath - arindam.nath@ymedialabs.com
2. Karthik C - karthik.c@ymedialabs.com
3. Rahul Ranjan Pandey - rahul.pandey@ymedialabs.com
4. Manjunath Subramanyam - manjunath.subramanyam@ymedialabs.com
5. Naresh - naresh.yadulla@ymedialabs.com

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).


## License

Nest is [MIT licensed](LICENSE).
