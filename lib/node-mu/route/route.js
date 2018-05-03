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
 * lib/node-mu/route/route.js
 */

'use strict';

const express = require('express');
const { LoggerWrapper } = require('../logger');

// TODO: add controls on leading '/' on paths

class Route {
  constructor(basePath) {
    this.logger = new LoggerWrapper(this.constructor.name);
    this._basePath = basePath;
    this._router =  express.Router();
    this.logger.debug('Route base path: ' + this._basePath);

    this._setupRoutes();
  }

  get router() {
    return this._router;
  }

  get basePath() {
    return this._basePath;
  }

  addRoute(method, path, handler) {    
    this._router.route(path)[method](handler);
    this.logger.info(`[${method.toUpperCase()} ${this._basePath}${path}] route configured`);
  }

  get(path, handler) {
    this.addRoute('get', path, handler);
  }

  post(path, handler) {
    this.addRoute('post', path, handler);
  }

  put(path, handler) {
    this.addRoute('put', path, handler);
  }

  delete(path, handler) {
    this.addRoute('delete', path, handler);
  }

  patch(path, handler) {
    this.addRoute('patch', path, handler);
  }

  options(path, handler) {
    this.addRoute('options', path, handler);
  }

  head(path, handler) {
    this.addRoute('head', path, handler);
  }

  _setupRoutes() {
    this.logger.debug(`setting up routes for ${this.constructor.name}`);
    this.$setupRoutes();
  }

  $setupRoutes() {
    throw `${this.constructor.name}.setupRoutes() not implemented: please, implement the function to register your routes!`;
  }

}

module.exports = { Route };
