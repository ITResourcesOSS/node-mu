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
 * lib/index.js
 */

'use strict';

// yeah, I know... it's a global! ... go on :)!
Promise = require('bluebird');

const inversify = require('inversify');
require('reflect-metadata');
const ioc = require('./node-mu/ioc');
const Application = require('./node-mu/application');

const {LoggerWrapper} = require('./node-mu/logger');
const logger = new LoggerWrapper('build');


/**
 * Register the application Service class into the inversify IoC Container and returns the managed instance.
 *
 * @param applicationClass - the actual service class
 * @returns {*}
 */
const build = (applicationClass) => {
  logger.info('starting service', true);

  const application = ioc.container.get(applicationClass.prototype.ioc.id);
  logger.info(`service Application instance [${application.id}] builded`, true);
  return application;
};

/* main export */
exports = module.exports = (applicationClass) => {
  return build(applicationClass);
};


/**
 * Main lib exports
 * @module node-mu
 * @public
 */
exports.ioc = ioc;
exports.Application = Application;
exports.Providers = require('./node-mu/providers');
exports.Controllers = require('./node-mu/components').Controllers;
exports.Route = require('./node-mu/components').Route;
exports.Component = require('./node-mu/components').Component;
exports.Repository = require('./node-mu/components').Repository;
exports.Service = require('./node-mu/components').Service;
exports.LoggerWrapper = LoggerWrapper;
exports.Utils = require('./node-mu/utils');