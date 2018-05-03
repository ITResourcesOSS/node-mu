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
 * lib/node-mu/api/api.js
 */

'use strict';

const express = require('express');
const Router = require('./router');
const http = require('http');
const enableDestroy = require('server-destroy');
const { LoggerWrapper } = require('../logger');

class Api extends Router {
  constructor(params) {
    super();
    this.logger = new LoggerWrapper(this.constructor.name);
    
    this._params = params;
    this._app = express();

    this.logger.info('initializing API Server');
    this.logger.info('routing with basePath: ' + this._params.baseRoutingPath);
    this._app.use(this._params.baseRoutingPath, this.routes);
  }

  async start() {
    return new Promise((resolve, reject) => {
      this.logger.debug('starting API server')
      this._server = http.createServer(this._app);
      this._server.listen(this._params.port, (err) => {
        if (err) {
          return reject(err);
        }
        this.logger.info(`API server Listening on http://${this._server.address().address}:${this._server.address().port}`);
        return resolve();
      });

      /* Hack to close all pending connections: https://github.com/isaacs/server-destroy */
      enableDestroy(this._server);
    });
  }

  async stop() {
    return new Promise((resolve, reject) => {
      this.logger.info('gracefully shutting down the Api server');
      if (this._server) {
        this._server.destroy(() => {
          this.logger.info('API server destroyed');
          return resolve(true);
        });
      } else {
        this.logger.warn('[API] API server destroyed (it was null!)');
        return resolve(true);
      }
    });
  }
}

module.exports = Api;