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
 * lib/node-mu/api/router.js
 */

'use strict';
const express = require('express');

class Router {
  constructor() {
    this._router = express.Router();
  }

  get routes() {
    return this._router;
  }
  
  addRoute(path, route) {
    this._router.use(path, route);
  }

  /*
  addRoute(route) {
    this._router.use(route.basePath, route.router);
  }
  */
}

module.exports = Router;