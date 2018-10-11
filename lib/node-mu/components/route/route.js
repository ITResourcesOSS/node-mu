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
 * lib/node-mu/components/route/route.js
 */

'use strict';

const Component = require('../component');
const express = require('express');
const validate = require('express-validation');

class Route extends Component {
  constructor(basePath = '/') {
    super();
    this._basePath = basePath;
    this._router = express.Router();
    if (this._basePath) this._logger.debug('Route base path: ' + this._basePath);
  }

  route(basePath = '/', validationRules = []) {
    this._basePath = basePath;
    this._logger.debug('Route base path: ' + this._basePath);
    this._validationRules = validationRules;
    return this;
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
   * @param {[function]} handlers - The route handlers (middlewares... handler).
   */
  addRoute(method, path, ...handlers) {
    this._logger.debug(`addRoute() - method: '${method}', path: '${path}'`);
    const _validationRule = this.getValidationRule(path);
    let validationOnRoute = false;
    if (_validationRule && this._checkValidationRuleMethod(_validationRule.method, method)) {
      this._logger.debug(`adding validation rule for method '${method}' on paht '${path}'`);
      handlers.splice(0, 0, validate(_validationRule));
      validationOnRoute = true;
    }

    this._router.route(path)[method](handlers);
    this._logger.info(`[${method.toUpperCase()} ${this._basePath}${path}] route configured ${validationOnRoute ? ' (with validation rule)' : ''}`);
    return this;
  }

  _checkValidationRuleMethod(ruleMethods, method) {
    if(typeof ruleMethods !== "undefined" && ruleMethods != null && ruleMethods.length != null && ruleMethods.length > 0){
      for (let m of ruleMethods) {
        if ((new RegExp(m, 'i')).test(method)) {
          return true;
        }
      }
      return false;
    }
    return true;
  }

  /**
   * Adds a GET route.
   * @param {string} path - The route path.
   * @param {[function]} handlers - The route handlers (middlewares... handler).
   */
  get(path, ...handlers) {
    return this.addRoute('get', path, handlers);
  }

  /**
   * Adds a POST route.
   * @param {string} path - The route path.
   * @param {[function]} handlers - The route handlers (middlewares... handler).
   */
  post(path, ...handlers) {
    return this.addRoute('post', path, handlers);
  }

  /**
   * Adds a PUT route.
   * @param {string} path - The route path.
   * @param {[function]} handlers - The route handlers (middlewares... handler).
   */
  put(path, ...handlers) {
    return this.addRoute('put', path, handlers);
  }

  /**
   * Adds a DELETE route.
   * @param {string} path - The route path.
   * @param {[function]} handlers - The route handlers (middlewares... handler).
   */
  delete(path, ...handlers) {
    return this.addRoute('delete', path, handlers);
  }

  /**
   * Adds a PATCH route.
   * @param {string} path - The route path.
   * @param {[function]} handlers - The route handlers (middlewares... handler).
   */
  patch(path, ...handlers) {
    return this.addRoute('patch', path, handlers);
  }

  /**
   * Adds an OPTIONS route.
   * @param {string} path - The route path.
   * @param {[function]} handlers - The route handlers (middlewares... handler).
   */
  options(path, ...handlers) {
    return this.addRoute('options', path, handlers);
  }

  /**
   * Adds a HEAD route.
   * @param {string} path - The route path.
   * @param {[function]} handlers - The route handlers (middlewares... handler).
   */
  head(path, ...handlers) {
    return this.addRoute('head', path, handlers);
  }

  setValidationRules(rules) {
    this._validationRules = rules;
    return this;
  }

  getValidationRule(path) {
    if (this._validationRules) {
      return this._validationRules[path];
    }

    return undefined;
  }

  /**
   * Helper function called by the Service during initialization.
   * Implement it in the derived Route class
   */
  $setupRoutes() {
  }

  /**
   * Helper function called by the Service during initialization.
   * Implement it in the derived Route class
   */
  $setupValidationRules() {
  }


}

module.exports = Route;
