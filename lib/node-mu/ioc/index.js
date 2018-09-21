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
 * lib/node-mu/ioc/index.js
 */

'use strict';

const inversify = require('inversify');
require('reflect-metadata');
const IocContainer = new (require('./ioc-container'))();
const container = IocContainer.container;
const logger = IocContainer.logger;
//const ProvidersRegister = require('../providers/health/providers-register');
const RoutesRegister = require('../providers/api/routes-register');

const injectable = (target, singleton = false) => {
  logger.debug(`registering ${target.name} type as injectable`);
  target.prototype.ioc = {id: target.name};
  inversify.decorate(inversify.injectable(), target);
  logger.debug(`binding '${target.prototype.ioc.id}' to ${target.name} into the IoC Container`);
  const _bindContext = container.bind(target.name).to(target);
  if (singleton) {
    _bindContext.inSingletonScope();
    logger.debug(`${target.name} binded as Singleton`);
  }
  return target;
};

const component = (target) => {
  return injectable(target);
};

const provider = (target, singleton = true) => {
  const injectableProvider = injectable(target, singleton);
  //ProvidersRegister.register(injectableProvider.prototype.ioc.id);
  logger.debug(`provider ${injectableProvider.prototype.ioc.id} registered into the Providers Register`);
  return injectableProvider;
};

const factoryFunction = (target) => {
  logger.debug(`registering factory ${target.name} type as injectable`);
  target.prototype.ioc = {id: target.name};
  logger.debug(`binding '${target.prototype.ioc.id}' to ${target.name} into the IoC Container`);
  container.bind(target.name).toFunction(target);
  return target;
};

const controller = (target) => {
  return injectable(target);
};

const route = (target) => {
  const injectableRoute = injectable(target);
  RoutesRegister.register(injectableRoute.prototype.ioc.id);
  logger.debug(`route ${injectableRoute.prototype.ioc.id} registered into the Routes Register`);
  return injectableRoute;
};

const service = (target) => {
  return injectable(target);
};

const repository = (target) => {
  return injectable(target);
};

const application = (target) => {
  let appTarget = injectable(target, true);
  global.APPLICATION_TYPE = appTarget.prototype.ioc.id;
  return appTarget;
};

const isInjectable = (target) => {
  return target.prototype.ioc && target.prototype.ioc.id;
};

const inject = (injectables, target) => {
  for (let order = 0; order < injectables.length; order++) {
    const injectable = injectables[order];
    logger.debug(`injecting ${injectable.name} into ${target.name}`);
    if (!isInjectable(injectable)) {
      throw Error(`${injectable.name} is not registered as injectable in the IoC Container.`);
    } else if (!container.isBound(injectable.prototype.ioc.id)) {
      throw Error(`${injectable.name} is unbound in the IoC Container.`);
    }

    logger.debug(`making ${injectable.prototype.ioc.id} injectable into ${target.name}`);
    inversify.decorate(inversify.inject(injectable.prototype.ioc.id), target, order);
  }

  return target;
};


module.exports = {
  container,
  injectable,
  component,
  provider,
  factoryFunction,
  route,
  controller,
  service,
  repository,
  application,
  inject
};
