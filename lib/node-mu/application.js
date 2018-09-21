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
 * lib/node-mu/application.js
 */

'use strict';

require('reflect-metadata');

const {container, Injectable, Inject} = require('./ioc');
const config = require('config');
const {Component} = require('./components');
const RoutesRegister = require('./providers/api/routes-register');
const ProvidersRegister = require('./providers/health/providers-register');

/**
 * The main Service class from which derive our service.
 *
 * @public
 */
class Application extends Component {
  constructor() {
    super();
  }

  /**
   * Runs the service.
   * @returns {Promise<void>}
   */
  async run() {
    try {
      this._logger.info('[*] BOOTSTRAP');
      await this.$bootstrap();

      await this._start();

      this._logger.info('[*] POST-BOOTSTRAP');
      await this.$postBootstrap();

      this._logger.info(`service started [pid: ${process.pid}]`, true);
    } catch (err) {
      throw err;
    }
  }

  /**
   * To be implemented in the derived service class to initialize anything useful.
   * Normally used to register injectable components.
   * @returns {Promise<void>}
   */
  async $bootstrap() {
    this._logger.info('$bootstrap() not implemented');
  }

  /**
   * To be implemented in the derived service class to initialize anything useful after all components initialization.
   * Normally used to setup Providers configurations (a.e. ElastichSearchClient provider indexes checks and init).
   * @returns {Promise<void>}
   */
  async $postBootstrap() {
    this._logger.warn('$postBootstrap() not implemented');
  }

  /**
   * Try and start the injected provider (if it has been injected ... != null).
   *
   * @param provider
   * @param after
   * @returns {Promise<void>}
   */
  async _startProvider(provider) {
    if (provider) {
      try {
        this._logger.debug(`[*] starting injected ${provider.constructor.name} provider`);
        await provider.$start();
      } catch (err) {
        throw err;
      }
    }
  }

  // TODO: make a better providers loading procedure (configuring, rules, etc...)
  async _startInjectedProviders() {
    return new Promise(async (resolve, reject) => {
      try {

        // TOTALLY ASYNC PROVIDERS INITIALIZATION
        /*
        const startProviderPromises = Object.keys(this)
          .filter(k => {
            let obj = Object(this)[k];
            if (/(provider)/i.test(obj.ctype) || /router/i.test(obj.ctype)) {
              return k;
            }
          })
          .map(async (k) => {
            return new Promise(async (resolve, reject) => {
              try {
                let obj = Object(this)[k];
                await this._startInjectedProvider(obj);

                // setup routes for each Api provider
                if (/router/i.test(obj.ctype)) {
                  await this._setupRoutes(obj);
                }

                resolve()
              } catch (err) {
                reject(err);
              }
            });
          });

        Promise.all(startProviderPromises)
          .then(() => {
            this._logger.info('[*] all Providers started');
            resolve();
          });
         */

        // SEQUENTIAL PROVIDERS INITIALIZATION
        for (let k of Object.keys(this)) {
          let obj = Object(this)[k];
          if (/(provider)/i.test(obj.ctype)) {
            await this._startProvider(obj);
            this._logger.info(`[*] ${obj.constructor.name} provider started`, true);
            ProvidersRegister.register(obj.constructor.name);

            // setup routes for each Api provider
            if (/router/i.test(obj.ctype)) {
              await this._setupRoutes(obj);
            }
          }
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Start the service registering providers
   * @returns {Promise<void>}
   * @private
   */
  async _start() {
    try {
      this._logger.info('starting providers');
      await this._startInjectedProviders();

      try {
        const mgmtConfig = config.get('management');
        if (mgmtConfig.health) {
          this._health = container.get('Health');
          await this._startProvider(this._health);
        } else {
          this._logger.warn('No Health provider configured. Could be difficult to integrate with a Service Registry.', true);
        }
        this._management = container.get('Management');
        await this._startProvider(this._management);
      } catch (err) {
        console.log(err);
        this._logger.warn('No Management provider configuration found. The service will not have a Management endpoint.');
      }

      this._logger.info('registering service shutdown hook');
      const shudownHook = async () => {
        try {
          console.log('\n');
          this._logger.info('\uD83D\uDCA3  [shutdownHook] BORN TO KILL SERVICES!');
          await this.stop();
          process.exit(0);
        } catch (err) {
          this._logger.error(`error killing service process: ${err}`);
          process.exit(1);
        }
      };

      process.on('SIGTERM', shudownHook);
      process.on('SIGINT', shudownHook);

    } catch (err) {
      throw err;
    }
  }

  /** Stops the service */
  async stop() {
    return new Promise(async (resolve, reject) => {
      try {
        this._logger.info('gracefully shutting down the service');

        for (let k of Object.keys(this)) {
          let obj = Object(this)[k];
          if (/(provider)/i.test(obj.ctype)) {
            obj.$stop && await obj.$stop();
            this._logger.info(`${obj.name} provider stoppped`);
          }
        }

        this._logger.info('service shutted down. Bye!');
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Set up the API routes.
   * @private
   */
  async _setupRoutes(api) {
    return new Promise((resolve, reject) => {
      try {
        this._logger.info(`setting up routes for ${this.constructor.name}`);
        RoutesRegister.ids.forEach(iocId => {
          const route = container.get(iocId);
          this.addRoute(api, route);
        });
        //this.$setupRoutes();
        resolve();
      } catch (err) {
        reject(err);
      }
    });

  }

  async _setHealthRoute() {
    return new Promise((resolve, reject) => {
      try {
        const healthRoute = container.get('HealthRoute');
        this.addRoute(healthRoute);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Set up the API routes. To be implemented in the actual service class.
   * @abstract
   */
  //$setupRoutes() {
  //}


  /**
   * Add a route to the API router.
   * @param {*} route - The route to add.
   */
  addRoute(api, route) {
    route.$setupValidationRules();
    route.$setupRoutes();
    api.addRoute(route.basePath, route.router);
  }

  /**
   * Called from derived service class to set injected instances (usually the injected providers instances)
   * @param n - the instance to set
   */
  set ['name'](n) {
    this['name'] = n;
  }

}

module.exports = Application;