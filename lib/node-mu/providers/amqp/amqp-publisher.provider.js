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
 * lib/node-mu/providers/amqp/amqp-publisher.provider.js
 */

'use strict';

const {inject, provider} = require('../../ioc');
const Provider = require('../provider');
const AmqpConnectionManager = require('./amqp-connection-manager.provider');

module.exports =
  inject(
    [AmqpConnectionManager],
    provider(
      class AmqpPublisher extends Provider {
        constructor(amqpConnectionManager) {
          super();
          this._channel = amqpConnectionManager.channel;
        }

        init(destination) {
          this._destination = destination;
          this._logger.debug(`destination ${JSON.stringify(this._destination)} initialized`);
        }

        publish(evt) {
          // const destination = dest || this._destination;
          this._logger.debug(`publishing to: ${JSON.stringify(this._destination)}`);

          this._logger.debug('check exchange');
          this._channel.checkExchange(this._destination.name)
            .then((res, err) => {
              if (err) {
                this._logger.error('** ' + err);
                return;
              }
              this._logger.debug(`check exchange ${this._destination.name} ok`);
              const result = this._channel.publish(this._destination.name, this._destination.route, new Buffer(JSON.stringify(evt)));
              this._logger.debug(`publish result: ${result}`);
            })
            .catch((err) => {
              this._logger.error(`AMQP exchange ${this._destination.name} does not exists. Error: ${err}`);
            })
        }
      }
    )
  );
