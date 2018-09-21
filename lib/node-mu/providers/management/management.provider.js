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
 * lib/node-mu/providers/management/management.provider.js
 */

'use strict';

const {provider} = require('../../ioc');
const express = require('express');
const Router = require('../api/router');
const http = require('http');
const bodyParser = require('body-parser');
const compression = require('compression');
const methodOverride = require('method-override');
const helmet = require('helmet');
const cors = require('cors');
const ignoreFavicon = require('../api/middlewares/ignore-favicon');
const errorMiddleware = require('../api/middlewares/error');
const enableDestroy = require('server-destroy');
const expressWinston = require('express-winston');
const RequestLoggerTransport = require('../api/request-logger-transport');
const config = require('config');
const {fullInfo} = require('../../utils').serviceInfo;
const ioc = require('../../ioc').container;
const os = require('os');

module.exports =
  provider(
    class Management extends Router {
      constructor() {
        super();
        this._mgmtConfig = config.get('management');
        this._mgmtApp = express();

        this._mgmtPath = this._mgmtConfig.endpoint.baseRoutingPath || '/management';
        this._configureApp();

        this._logger.info('initializing Management server');
        this._logger.info(`routing with basePath ${this._mgmtPath}`);
        this._mgmtApp.use(this._mgmtPath, this.routes);
      }

      async $start() {
        return new Promise((resolve, reject) => {
          this._logger.debug('starting Management server');
          this._server = http.createServer(this._mgmtApp);
          this._server.listen(this._mgmtConfig.endpoint.port, (err) => {
            if (err) {
              return reject(err);
            }
            this._logger.info(`Management server listening on http://${this._server.address().address}:${this._server.address().port}`);
            return resolve();
          });

          /* Hack to close all pending connections: https://github.com/isaacs/server-destroy */
          enableDestroy(this._server);
        });
      }

      /** Stops the Management Http server. */
      async $stop() {
        return new Promise((resolve, reject) => {
          this._logger.info('gracefully shutting down the Management server');
          if (this._server) {
            this._server.destroy(() => {
              this._logger.info('Management server destroyed');
              return resolve(true);
            });
          } else {
            this._logger.warn('[Management] Management server destroyed (it was null!)');
            return resolve(true);
          }
        });
      }

      /**
       * Configure the Express app.
       * @private
       */
      _configureApp() {
        this._logger.debug('configuring Management express app');

        this._requestLoggerTransport = new RequestLoggerTransport();
        this._mgmtApp.use(expressWinston.logger(this._requestLoggerTransport.requestsLoggerTransports));

        this._mgmtApp.use(bodyParser.json());
        this._mgmtApp.use(bodyParser.urlencoded({extended: true}));
        this._mgmtApp.use(compression());
        this._mgmtApp.use(methodOverride());
        this._mgmtApp.use(helmet());
        this._mgmtApp.use(cors());
        this._mgmtApp.use(ignoreFavicon);

        // TODO: add the ability to configure other Management endpoints

        // service info endpoint
        this.addRoute('/info', (req, res) => {
          res.json(fullInfo());
        });

        // service health endpoint
        this.addRoute('/health', async (req, res) => {
          try {
            const healthService = ioc.get('Health');
            const health = await healthService.health();
            return res.json(health);
          } catch (err) {
            throw err;
          }
        });
      }

      get $healthId() {
        return 'management';
      }
    }
  );
