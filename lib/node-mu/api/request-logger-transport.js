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
 * lib/node-mu/api/request-logger-transport.js
 */

'use strict';

const path = require('path');
const winston = require('winston');
require('winston-daily-rotate-file');
const fs = require('fs');
const Config = require('../config');
const { LoggerWrapper } = require('../logger');

const REQUESTS_LOGGER_TRANSPORTS = 'requests';
const ERRORS_LOGGER_TRANSPORTS = 'errors';

class RequestLoggerTransport {
  constructor() {
    this.logger = new LoggerWrapper(this.constructor.name);
    this._configuration = (new Config()).configuration;
    //this._configuration.serviceBasePath

    this.logger.debug('*** LOGS Configuration: ' + JSON.stringify(this._configuration, undefined, 2));

    this._requestsLoggerTransports = this._configure(REQUESTS_LOGGER_TRANSPORTS);
    this.logger.debug('requests transports initialized');

    this._errorsLoggerTransports = this._configure(ERRORS_LOGGER_TRANSPORTS);
    this.logger.debug('errors transports initialized');
  }

  get requestsLoggerTransports() {
    return this._requestsLoggerTransports;
  }

  get errorLoggerTransports() {
    return this._errorsLoggerTransports;
  }

  _configure(type) {
    const fullPath = path.join(this._configuration.serviceBasePath, this._configuration.logs.path);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath);
    }

    switch(type) {
      case REQUESTS_LOGGER_TRANSPORTS: 
        return this._configureTransports(fullPath, this._configuration.logs.requests.file, this._configuration.logs.requests.console);
        break;
      case ERRORS_LOGGER_TRANSPORTS:
        return this._configureTransports(fullPath, this._configuration.logs.errors.file, this._configuration.logs.errors.console);
        break;
      default:
        logger.error('Unexpected express winston transport configuration type');
    }
  }

  _configureTransports(logFullPath, logFile, logToConsole) {
    const fullname = path.join(logFullPath, logFile);
    const fileTransport = new (winston.transports.DailyRotateFile)({
      filename: fullname + '-%DATE%.log',
      datePattern: 'DD-MM-YYYY',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: this._configuration.logs.level,
      json: false
    });

    const transports = [fileTransport];
    if (logToConsole) {
      transports.push(new winston.transports.Console({ json: false, colorize: true, level: this._configuration.logs.level }));
    }

    return { transports: transports, expressFormat: true };
  }
}

module.exports = RequestLoggerTransport;
