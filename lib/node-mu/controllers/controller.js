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
 * lib/node-mu/controllers/controller.js
 */

'use strict';

const autoBind = require('auto-bind');
const { LoggerWrapper } = require('../logger');

class Controller {
  constructor() {
    this.logger = new LoggerWrapper(this.constructor.name);
    this.logger.info('auto-binding all methods');
    autoBind(this);
  }
}

module.exports = Controller;