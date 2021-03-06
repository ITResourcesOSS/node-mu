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
 * lib/node-mu/logger/logger.js
 */

'use strict';

const path = require('path');
const config = require('config');
const winston = require('winston');
require('winston-daily-rotate-file');
const fs = require('fs');
const { serviceInfo } = require('../utils');
const moment = require('moment');

let _instance = null;

/** Singleton for the main logger class. */
class Logger {
  constructor() {
    if (!_instance) {
      this._configuration = config.get('log');
      this._initialize();
      _instance = this;
    } else {
      return _instance;
    }
  }

  /**
   * Initialize the logger Winston transport.
   * @private
   */
  _initialize() {
    const fullPath = path.join(process.cwd(), this._configuration.path);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath);
    }

    const fullname = path.join(fullPath, serviceInfo.name);
    const timestampFormat = 'DD/MM/YYYY HH:mm:ss.SSSS';

    const fileTransport = new (winston.transports.DailyRotateFile)({
      filename: fullname + '-%DATE%.log',
      datePattern: 'DD-MM-YYYY',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: this._configuration.level,
      json: false,
      timestamp: () => { return moment().format(timestampFormat) }
    });
  
    const transports = [fileTransport];
    if (this._configuration.console) {
      transports.push(new winston.transports.Console({
        json: false,
        colorize: true,
        level: this._configuration.level,
        timestamp: () => { return moment().format(timestampFormat) }
      }));
    }


    this._logger = new (winston.Logger)({
      transports,
    });
    this._logger.exitOnError = false;
  }

  /**
   * Returns this logger object.
   * @return {winston.Logger} _logger - The internal winston logger instance.
   */
  get logger() {
    return this._logger;
  }
}

module.exports = Logger;
