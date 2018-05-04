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
 * lib/node-mu/service.js
 */

'use strict';

const DotEnvReader = require('./dotenv');
const Config = require('./config');
const Api = require('./api');
const DbConnectionManager = require('./db');
const { AmqpConnectionManager } = require('./amqp');
const { LoggerWrapper } = require('./logger');

class Service {
  constructor(serviceBasePath) {
    const dotEnvReader = new DotEnvReader(serviceBasePath);
    this._configuration = (new Config(dotEnvReader.envs)).configuration;
    this.logger = new LoggerWrapper(this.constructor.name);
    this.logger.debug('service config: ' + JSON.stringify(this._configuration));
  }

  // start and stop functionalities

  async start() {
    try {
      if (this._configuration.knexConfig) {
        await this._dbConnect();
      }

      if (this._configuration.rabbit) {
        await this._amqpConnect();
      }

      await this._startApi();
      this.logger.info('API server started');

      this._setupRoutes();

      const shutdownHook = async () => {
        this.logger.info('[shutdownHook] BORN TO KILL SERVICES!');
        await this.stop();
        process.exit(0);
      };

      process.on('SIGTERM', shutdownHook);
      process.on('SIGINT', shutdownHook);
    } catch (err) {
      throw err;
    }
  }

  async stop() {
    return new Promise(async (resolve, reject) => {
      // list here the shutwdown list
      this.logger.info('gracefully shutting down the service');
      if (this._api) {
        await this._api.stop();
      }

      this.logger.info('service shutted down. Bye!');
      return resolve(true);
    });
  }

  async _dbConnect() {
    try {
      const dbConnectionManager = new DbConnectionManager(this._configuration.knexConfig);
      await dbConnectionManager.connectObjection();
    } catch (error) {
      throw error;
    }
    
  }

  _startApi() {
    return new Promise((resolve, reject) => {
      this._api = new Api({
        baseRoutingPath: this._configuration.baseRoutingPath,
        port: this._configuration.port
      });
      this._api.start().then(resolve).catch(reject);
    });
  }

  async _amqpConnect() {
    return new Promise(async (resolve, reject) => {
      try {
        const amqpConnectionManager = new AmqpConnectionManager();
        await amqpConnectionManager.connect();
        resolve();
      } catch (error) {
        reject(error);
      }
      
    });
  }

  _setupRoutes() {
    this.logger.info(`setting up routes for ${this.constructor.name}`);
    this.$setupRoutes();
  }

  // abstract function: to be implementes in derived Service class
  $setupRoutes() {
    throw `${this.constructor.name}.$setupRoutes() Not implemented: please, implement this function to register your service routes!`;
  }

  addRoute(route) {
    this._api.addRoute(route.basePath, route.router);
  }
}

module.exports = Service;
