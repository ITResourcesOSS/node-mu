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
 * lib/node-mu/providers/api/api.provider.js
 */

'use strict';

const {container, provider} = require('../../ioc');
const express = require('express');
const Router = require('./router');
const http = require('http');
const bodyParser = require('body-parser');
const compression = require('compression');
const methodOverride = require('method-override');
const helmet = require('helmet');
const cors = require('cors');
const ignoreFavicon = require('./middlewares/ignore-favicon');
const errorMiddleware = require('./middlewares/error');
const enableDestroy = require('server-destroy');
const expressWinston = require('express-winston');
const RequestLoggerTransport = require('./request-logger-transport');
const passport = require('passport');
const passportStrategy = require('./passport-strategy');
const config = require('config');
const routesRegister = require('./routes-register');

module.exports =
  provider(
    class Api extends Router {
      constructor() {
        super();

        this._endpointConfig = config.get('api.endpoint');
        this._securityConfig = config.get('api.security');
        //this._jwtConfig = config.get('jwt');

        this._app = express();
        this._configureApp();

        this._logger.info('initializing API server');
        this._logger.info(`routing with basePath: ${this._endpointConfig.baseRoutingPath}`);
        this._app.use(this._endpointConfig.baseRoutingPath, this.routes);

        this._logger.info('setting up error handler');
        this._setupErrorHandlers();
      }

      async $start() {
        return new Promise((resolve, reject) => {
          this._logger.debug('starting API server');
          this._server = http.createServer(this._app);
          this._server.listen(this._endpointConfig.port, (err) => {
            if (err) {
              return reject(err);
            }
            this._logger.info(`API server Listening on http://${this._server.address().address}:${this._server.address().port}`);

            return resolve();
          });

          /* Hack to close all pending connections: https://github.com/isaacs/server-destroy */
          enableDestroy(this._server);
        });
      }

      /** Stops the API Http server. */
      async $stop() {
        return new Promise((resolve, reject) => {
          this._logger.debug('gracefully shutting down the Api server');
          if (this._server) {
            this._server.destroy(() => {
              this._logger.debug('API server destroyed');
              return resolve(true);
            });
          } else {
            this._logger.warn('[API] API server destroyed (it was null!)');
            return resolve(true);
          }
        });
      }

      /**
       * Configure the Express app.
       * @private
       */
      _configureApp() {
        this._logger.debug('configuring API express app');

        this._requestLoggerTransport = new RequestLoggerTransport();
        this._app.use(expressWinston.logger(this._requestLoggerTransport.requestsLoggerTransports));

        this._app.use(bodyParser.json());
        this._app.use(bodyParser.urlencoded({extended: true}));
        this._app.use(compression());
        this._app.use(methodOverride());
        this._app.use(helmet());
        this._app.use(cors({exposedHeaders: '*'}));
        this._app.use(ignoreFavicon);

        //if (this._endpointConfig.authEnabled) {
        if (this._securityConfig.enabled) {
          this._app.use(passport.initialize());
          passport.use('jwt', passportStrategy(this._securityConfig.jwt.secret));
        }

      }

      /**
       * Configure the Api error handlers.
       * @private
       */
      _setupErrorHandlers() {
        // configure error logger
        this._app.use(expressWinston.errorLogger(this._requestLoggerTransport.errorLoggerTransports));
        this._logger.debug('errorLogger ok');

        // convert APIError error
        this._app.use(errorMiddleware.converter);
        this._logger.debug('errorMiddleware.converter ok');

        // catch 404 and go on to error handler
        this._app.use(errorMiddleware.notFound);
        this._logger.debug('errorMiddleware.notFound ok');

        // error handler: stacktrace is sent only in development
        this._app.use(errorMiddleware.handler);
        this._logger.debug('errorMiddleware.handler ok');
      }

      get $healthId() {
        return 'api';
      }
    }
  );