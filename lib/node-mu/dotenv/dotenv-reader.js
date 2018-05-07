/*!
 * node-mu
 * node.js minimalistic microservices framework on top of Express.js
 * 
 * Copyright(c) 2018 IT Resources s.r.l.
 * Copyright(c) 2018 Luca Stasio <joshuagame@gmail.com>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 * See node-mu license text even in LICENSE file.
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
      eventsMapFile: process.env.EVENTS_MAP_FILE,
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