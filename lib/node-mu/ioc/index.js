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
const RoutesRegister = require('../providers/api/routes-register');
const constants = require('./constants');


const injectable = (target, singleton = false) => {
  logger.debug(`Injectable: registering ${target.name} type as injectable`);

  const iocMetadata = target.name;
  Reflect.defineMetadata(constants.IOC_ID, iocMetadata, target);

  inversify.decorate(inversify.injectable(), target);
  logger.debug(`Injectable: binding '${iocMetadata}' to ${target.name} into the IoC Container`);

  // bind into the container
  const _bindContext = container.bind(target.name).to(target);
  if (singleton) {
    _bindContext.inSingletonScope();
    logger.debug(`${target.name} binded as Singleton`);
  }

  return target;
};

const inject = (injectables, target) => {
    for (let order = 0; order < injectables.length; order++) {
      const injectable = injectables[order];
      logger.debug(`Inject: injecting ${injectable.name} into ${target.name}`);

      const iocId = Reflect.getMetadata(constants.IOC_ID, injectable);
      if (iocId === undefined) {
        throw Error(`Inject: ${injectable.name} is not registered as injectable in the IoC Container.`);
      } else if (!container.isBound(iocId)) {
        throw Error(`Inject: ${injectable.name} is unbound in the IoC Container.`);
      }

      logger.debug(`Inject: making ${iocId} injectable into ${target.name}`);
      inversify.decorate(inversify.inject(iocId), target, order);
    }

  return target;
};

const component = (target) => {
  return injectable(target);
};

const provider = (target, singleton = true) => {
  const injectableProvider = injectable(target, singleton);
  const iocId = Reflect.getMetadata(constants.IOC_ID, injectableProvider);
  logger.debug(`provider ${iocId} registered into the Providers Register`);
  return injectableProvider;
};

const factoryFunction = (target) => {
  logger.debug(`registering factory ${target.name} type as injectable`);
  const iocMetadata = target.name;
  Reflect.defineMetadata(constants.IOC_ID, iocMetadata, target);
  logger.debug(`binding '${iocMetadata}' to ${target.name} into the IoC Container`);
  container.bind(target.name).toFunction(target);
  return target;
};

const controller = (target) => {
  return injectable(target);
};

/*
const Controller = (path, target) => {
  //const metadataHolder = container.get('ControllersMetadata');
  const currentMetadata = { path: path, target: target.name, code: '12' };
  Reflect.defineMetadata('node-mu:controller', currentMetadata, target);

  const previousMetadata = Reflect.getMetadata('node-mu:controller', Reflect) || [];
  const newMetadata = [currentMetadata, ...previousMetadata];
  Reflect.defineMetadata('node-mu:controller', newMetadata, Reflect);

  return target;
};
*/

const route = (target) => {
  const injectableRoute = injectable(target);
  const iocId = Reflect.getMetadata(constants.IOC_ID, injectableRoute);
  RoutesRegister.register(iocId);
  logger.debug(`route ${iocId} registered into the Routes Register`);
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
  const applicationIocId = Reflect.getMetadata(constants.IOC_ID, appTarget);
  Reflect.defineMetadata(constants.IOC_APP_ID, applicationIocId, Reflect);
  return appTarget;
};

module.exports = {
  container,
  injectable,
  component,
  provider,
  factoryFunction,
  route,
  controller,
  //Controller,
  service,
  repository,
  application,
  inject,
  constants
};
