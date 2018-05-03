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
 * lib/node-mu/controllers/index.js
 */

'use strict';

const Controller = require('./controller');
const EventsEmitterController = require('./events-emitter-controller');

module.exports = { Controller, EventsEmitterController };