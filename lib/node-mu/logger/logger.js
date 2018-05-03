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
 * lib/node-mu/logger/logger.js
 */

'use strict';

const path = require('path');
const Config = require('../config');
const winston = require('winston');
require('winston-daily-rotate-file');
const fs = require('fs');

let _instance = null;

class Logger {
  constructor() {
    if (!_instance) {
      this._configuration = (new Config()).configuration;
      this._initialize();
      _instance = this;
    } else {
      return _instance;
    }
  }

  _initialize() {
    const fullPath = path.join(this._configuration.serviceBasePath, this._configuration.logs.path);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath);
    }
    const fullname = path.join(fullPath, this._configuration.logs.file);

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
    if (this._configuration.logs.console) {
      transports.push(new winston.transports.Console({ json: false, colorize: true, level: this._configuration.logs.level }));
    }
  
    this._logger = new (winston.Logger)({
      transports,
    });
    this._logger.exitOnError = false;

    this._logger.info(` [${this.constructor.name}] logger initialized`);
  }

  get logger() {
    return this._logger;
  }
}

module.exports = Logger;
