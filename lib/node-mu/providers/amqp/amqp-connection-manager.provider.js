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
 * lib/node-mu/providers/amqp/amqp-connection-manager.provider.js
 */

'use strict';

const {provider} = require('../../ioc');
const {LoggerWrapper} = require('../../logger');
const Provider = require('../provider');
const config = require('config');
const amqp = require('amqplib');
const axios = require('axios');

module.exports =
  provider(
    class AmqpConnectionManager extends Provider {
      constructor() {
        super();
      }

      async $start() {
        try {
          this._amqpConfig = config.get('amqp');
          this._logger.debug(JSON.stringify(this._amqpConfig));

          await this.connect();
        } catch (err) {
          throw err;
        }
      }

      async $stop() {
        try {
          await this._channel.close();
          this._logger.debug('AMQP Channel closed');

          await this._connection.close();
          this._logger.debug('AMQP Connection closed');
        } catch (err) {
          throw err;
        }
      }

      /** Connect to the AMQP Server and open a channel on the connetion. */
      async connect() {
        if (!this._connection) {
          try {
            this._connection = await amqp.connect(this._amqpConfig.url);
            this._logger.info(`AMQP connection established`);
          } catch (error) {
            this._logger.error(`error connecting to AMQP: ${error}`);
            throw error;
          }
        }

        // here we open the channel to the queue
        if (!this._channel) {
          try {
            this._channel = await this._connection.createChannel();
            this._logger.info('AMQP channel opened');

            this._channel.on('error', async (err) => {
              this._logger.error(`error on AMQP channel: ${err}`);
            });
          } catch (error) {
            this._logger.error(`error creating channel on AMQP connection: ${error}`);
            throw error;
          }
        }
      }

      /**
       * Returns the AMQP connection channel.
       * @return {object} _channel - The AMQP connection channel.
       */
      get channel() {
        return this._channel;
      }

      async getRabbitHealth() {
        try {
          return await axios.get('http://guest:guest@127.0.0.1:15672/api/aliveness-test/%2F');
          /*, {
            auth: {
              username: 'guest',
              password: 'guest'
            }
          })*/
        } catch (err) {
          throw err;
        }
      }

      $isCheckableForHealth() {
        return true;
      }

      async $health() {
        return new Promise(async (resolve, reject) => {
          try {
            const response = await this.getRabbitHealth();
            resolve({
              status: 'UP',
              message: response.data
            });
          } catch (err) {
            if (err.errno == 'ECONNREFUSED') {
              reject({
                status: 'DOWN',
                message: err.stack
              });
            } else if (err.message.indexOf('401')) {
              reject({
                status: 'UNKNOWN',
                message: 'unauthorized RabbitMQ user'
              });
            }
          }
        });
      }

      get $healthId() {
        return 'amqp';
      }

    }
  );
