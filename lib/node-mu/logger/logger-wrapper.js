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
 * lib/node-mu/logger/logger-wrapper.js
 */

'use strict';

const Logger = require('./logger');

class LoggerWrapper {
  constructor(cname) {
    this._logger = (new Logger()).logger;
    this._cname = cname;
  }

  info(msg) {
    this._logger.info(` [${this._cname}] - ${msg}`);
  }

  debug(msg) {
    this._logger.debug(`[${this._cname}] - ${msg}`);
  }

  error(msg) {
    this._logger.error(`[${this._cname}] - ${msg}`);
  }

  warn(msg) {
    this._logger.warn(`[${this._cname}] - ${msg}`);
  }

}

module.exports = LoggerWrapper;