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
 * lib/node-mu/amqp/amqp-connection.js
 */

'use strict';

const { LoggerWrapper } = require('../logger');
const Config = require('../config');
const amqp = require('amqplib');
const EventEmitter = require('events');

const Hertzy = require('hertzy')

let _instance = null;

class AmqpConnectionManager {
  constructor() {
    if (!_instance) {
      this.logger = new LoggerWrapper(this.constructor.name);
      this._configuration = (new Config()).configuration.amqp;
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
        this.logger.error(`error connecting to AMQP on ${this._configuration.url}: ${error}`);
        throw error;
      }
    }

    if (!this._channel) {
      try {
        this._channel = await this._connection.createChannel();
        this.logger.info('channel created');

        this._channel.on('error', async (err) => {
          this.logger.error(`error on AMQP channel: ${err}`);
        });
      } catch (error) {
        this.logger.error(`error creating channel on AMQP connection: ${error}`);
        throw error;
      }
    }

    const conn = Hertzy.tune('conn');
    conn.on('conn:ok', (data) => {
      this.logger.debug('*** Got conn:ok event: ' + JSON.stringify(data, null, 2));
    });
  }

  get channel() {
    return this._channel;
  }

}

module.exports = AmqpConnectionManager;