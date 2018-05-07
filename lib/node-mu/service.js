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
const EventsEmitter = require('./events-emitter');
const { LoggerWrapper } = require('./logger');

/** The main Service class from which derive our service. */
class Service {

  /**
   * Initialize the service reading configuration .env starting from servceBasePath.
   * @param {string} serviceBasePath - The service code base path: usually '__dirname' in the actual service class.
   */
  constructor(serviceBasePath) {
    const dotEnvReader = new DotEnvReader(serviceBasePath);
    this._configuration = (new Config(dotEnvReader.envs)).configuration;
    this.logger = new LoggerWrapper(this.constructor.name);
    this.logger.debug('service config: ' + JSON.stringify(this._configuration));
  }

  /**
   * Starts the service.
   * Initialization:
   *    - DB connection   (if configured in the .env file)
   *    - AMQP connection (if configured in the .env file)
   *    - events map      (if configured in the .env file)
   *    - API Server with configured port and base routing path
   *    - Shutdown hooks to gently kill the service.
   */
  async start() {
    try {
      if (this._configuration.knexConfig) {
        await this._dbConnect();
      }

      if (this._configuration.amqp) {
        await this._amqpConnect();
        if (this._configuration.eventsMapFile) {
          // get events map configuration file by app configuration
          const eventsMapFile = `${this._configuration.serviceBasePath}/${this._configuration.eventsMapFile}`;
          this.logger.debug(`reading events map configuration from ${eventsMapFile}`);
          this._eventsMap = require(`${eventsMapFile}`).events;
          await this._initEventsEmitter();
        }
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

  /** Stops the service */
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

  /**
   * Got a Knex connection to the database and configure the Objection.js Model.
   * @private
   */
  async _dbConnect() {
    try {
      const dbConnectionManager = new DbConnectionManager(this._configuration.knexConfig);
      await dbConnectionManager.connectObjection();
    } catch (error) {
      throw error;
    }
    
  }

  /**
   * Starts the API Http Server.
   * @private
   */
  _startApi() {
    return new Promise((resolve, reject) => {
      this._api = new Api({
        baseRoutingPath: this._configuration.baseRoutingPath,
        port: this._configuration.port
      });
      this._api.start().then(resolve).catch(reject);
    });
  }

  /**
   * Initialize the connection to the configured AMQP server.
   * @private
   */
  _amqpConnect() {
    return new Promise(async (resolve, reject) => {
      try {
        const amqpConnectionManager = new AmqpConnectionManager();
        await amqpConnectionManager.connect();
        resolve(amqpConnectionManager);
      } catch (error) {
        reject(error);
      }
      
    });
  }

  /**
   * Initialize the Events Emitter with the actual service events map configuration.
   * @private
   */
  _initEventsEmitter() {
    return new Promise(async (resolve, reject) => {
      try {
        const eventsEmitter = new EventsEmitter();
        await eventsEmitter.registerEvents(this._eventsMap);
        resolve(eventsEmitter);
      } catch (error) {
        reject(error);
      }
    })
  }

  /**
   * Set up the API routes.
   * @private
   */
  _setupRoutes() {
    this.logger.info(`setting up routes for ${this.constructor.name}`);
    this.$setupRoutes();
  }

  /**
   * Set up the API routes. To be implemented in the actual service class.
   * @abstract
   */
  $setupRoutes() {
    throw `${this.constructor.name}.$setupRoutes() Not implemented: please, implement this function to register your service routes!`;
  }

  /**
   * Add a route to the API router.
   * @param {*} route - The route to add.
   */
  addRoute(route) {
    this._api.addRoute(route.basePath, route.router);
  }
}

module.exports = Service;
