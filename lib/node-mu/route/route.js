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
 * lib/node-mu/route/route.js
 */

'use strict';

const express = require('express');
const { LoggerWrapper } = require('../logger');

/** An API Route */
class Route {
  constructor(basePath) {
    this.logger = new LoggerWrapper(this.constructor.name);
    this._basePath = basePath;
    this._router =  express.Router();
    this.logger.debug('Route base path: ' + this._basePath);

    this._setupRoutes();
  }

  /**
   * Returns this route Express Router.
   * @return {express.Router} _router - This route Express Router.
   */
  get router() {
    return this._router;
  }

  /**
   * Returns thi route base path.
   * @return {string} _basePath - The base path for this route.
   */
  get basePath() {
    return this._basePath;
  }

  /**
   * Adds a route.
   * @param {string} method - HTTP method.
   * @param {string} path - The route path.
   * @param {function} handler - The route handler.
   */
  addRoute(method, path, handler) {    
    this._router.route(path)[method](handler);
    this.logger.info(`[${method.toUpperCase()} ${this._basePath}${path}] route configured`);
  }

  /**
   * Adds a GET route.
   * @param {string} path - The route path.
   * @param {function} handler - The route handler function.
   */
  get(path, handler) {
    this.addRoute('get', path, handler);
  }

  /**
   * Adds a POST route.
   * @param {string} path - The route path.
   * @param {function} handler - The route handler function.
   */
  post(path, handler) {
    this.addRoute('post', path, handler);
  }

  /**
   * Adds a PUT route.
   * @param {string} path - The route path.
   * @param {function} handler - The route handler function.
   */
  put(path, handler) {
    this.addRoute('put', path, handler);
  }

  /**
   * Adds a DELETE route.
   * @param {string} path - The route path.
   * @param {function} handler - The route handler function.
   */
  delete(path, handler) {
    this.addRoute('delete', path, handler);
  }

  /**
   * Adds a PATCH route.
   * @param {string} path - The route path.
   * @param {function} handler - The route handler function.
   */
  patch(path, handler) {
    this.addRoute('patch', path, handler);
  }

  /**
   * Adds an OPTIONS route.
   * @param {string} path - The route path.
   * @param {function} handler - The route handler function.
   */
  options(path, handler) {
    this.addRoute('options', path, handler);
  }

  /**
   * Adds a HEAD route.
   * @param {string} path - The route path.
   * @param {function} handler - The route handler function.
   */
  head(path, handler) {
    this.addRoute('head', path, handler);
  }

  /**
   * Set up routes.
   * @private
   */
  _setupRoutes() {
    this.logger.debug(`setting up routes for ${this.constructor.name}`);
    this.$setupRoutes();
  }


  /**
   * Set up routes.
   * @abstract
   */
  $setupRoutes() {
    throw `${this.constructor.name}.setupRoutes() not implemented: please, implement the function to register your routes!`;
  }

}

module.exports = { Route };
