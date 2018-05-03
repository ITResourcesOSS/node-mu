/*!
 * node-mu
 * node.js minimalistic microservices framework on top of Express.js
 * 
 * Copyright(c) 2018 IT Resources s.r.l.
 * Copyright(c) 2018 Luca Stasio <luca.stasio@itresources.it>
 * 
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
 * 
 * lib/node-mu/dotenv/dotenv-reader.js
 */

'use strict';

const path = require('path');

class DotEnvReader {
  constructor(envPath) {
    this._envPath = envPath;

    require('dotenv-safe').load({
      path: path.join(this._envPath, './.env'),
      sample: path.join(this._envPath, './.env.example'),
    });
  }

  get envs() {
    return {
      serviceBasePath: this._envPath,
      env: process.env.NODE_ENV,
      serviceGroup: process.env.SERVICE_GROUP || 'service-group',
      serviceName: process.env.SERVICE_NAME || 'service',
      serviceVersionMajor: process.env.SERVICE_VERSION_MAJOR || '0',
      serviceVersionMinor: process.env.SERVICE_VERSION_MINOR || '1',
      serviceVersionStatus: process.env.SERVICE_VERSION_STATUS || '0',
      port: process.env.PORT,
      baseRoutingPath: process.env.BASE_ROUTING_PATH || '/api',
      jwtSecret: process.env.JWT_SECRET,
      jwtExpirationMinutes: process.env.JWT_EXPIRATION_MINUTES,
      knexConfig: {
        client: process.env.DB_CLIENT,
        connection: {
          charset: process.env.DB_CHARSET,
          database: process.env.DB_NAME,
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PWD
        }
      },
      amqp: {
        url: process.env.NODE_ENV === 'test'
          ? process.env.AMQP_URL_TESTS
          : process.env.AMQP_URL,
        exchange: process.env.AMQP_EXCHANGE_NAME
      },
      logs: {
        console: process.env.LOG_CONSOLE,
        path: process.env.LOG_PATH || '../../logs',
        file: process.env.LOG_FILE,
        level: process.env.LOG_LEVEL,
        json: process.env.LOG_JSON,
        requests: {
          console: process.env.LOG_REQUESTS_CONSOLE,
          file: process.env.LOG_REQUESTS_FILE
        },
        errors: {
          console: process.env.LOG_ERRORS_CONSOLE,
          file: process.env.LOG_ERRORS_FILE
        }
      }
    };
  }
}

module.exports = DotEnvReader;