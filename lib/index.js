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
 * lib/index.js
 */

'use strict';

const Config = require('./node-mu/config');

Promise = require('bluebird'); 

const config = () => {
  const config = (new Config()).configuration;
  return config;
}

module.exports = {
  config,
  Service: require('./node-mu/service'),
  Controller: require('./node-mu/controllers').Controller,
  EventsEmitterController: require('./node-mu/controllers').EventsEmitterController,
  Route: require('./node-mu/route').Route,
  Logger: require('./node-mu/logger')
};