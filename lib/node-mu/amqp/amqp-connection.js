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
 * lib/node-mu/amqp/amqp-connection.js
 */

'use strict';

const { LoggerWrapper } = require('../logger');
const Config = require('../config');
const amqp = require('amqplib');

let _instance = null;

class AmqpConnectionManager {
  constructor() {
    if (!_instance) {
      this.logger = new LoggerWrapper(this.constructor.name);
      this._configuration = (new Config()).configuration.rabbit;
      this.logger.debug(`AMQP configuration ${JSON.stringify(this._configuration)}`);
      _instance = this;
    } else {
      return _instance;
    }
  }

  async connect() {
    if (!this._connection) {
      try {
        this._connection = await amqp.connect(this._configuration.url);
        this.logger.info(`AMQP connection established on ${this._configuration.url}`);
      } catch (error) {
        this.logger.error(`error connecting to RabbitMQ on ${this._configuration.url}: ${error}`);
        throw error;
      }
    }

    if (!this._channel) {
      try {
        this._channel = await this._connection.createChannel();
        this.logger.info('channel created');
      } catch (error) {
        this.logger.error(`error creating channel on RabbitMQ connection: ${error}`);
        throw error;
      }
    }
  }

}

module.exports = AmqpConnectionManager;