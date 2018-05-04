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
 * lib/node-mu/api/api.js
 */

'use strict';

const express = require('express');
const Router = require('./router');
const http = require('http');
const bodyParser = require('body-parser');
const compression = require('compression');
const methodOverride = require('method-override');
const helmet = require('helmet');
const cors = require('cors');
const ignoreFavicon = require('./middlewares/ignore-favicon');
const enableDestroy = require('server-destroy');
const { LoggerWrapper } = require('../logger');
const expressWinston = require('express-winston');
const RequestLoggerTransport = require('./request-logger-transport');

class Api extends Router {
  constructor(params) {
    super();
    this.logger = new LoggerWrapper(this.constructor.name);
    
    this._params = params;
    this._app = express();

    this._configureApp();

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

  _configureApp() {
    this.logger.debug('configuring API express app');
    
    this._requestLoggerTransport = new RequestLoggerTransport();
    this._app.use(expressWinston.logger(this._requestLoggerTransport.requestsLoggerTransports));

    this._app.use(bodyParser.json());
    this._app.use(bodyParser.urlencoded({ extended: true }));
    this._app.use(compression());
    this._app.use(methodOverride());
    this._app.use(helmet());
    this._app.use(cors());
    this._app.use(ignoreFavicon);
  }
}

module.exports = Api;