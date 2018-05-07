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
 * lib/node-mu/amqp/amqp-publisher.js
 */

'use strict';

const { LoggerWrapper } = require('../logger');
const Component = require('../component');
const AmqpConnectionManager = require('./amqp-connection');

class AmqpPublisher extends Component {
  constructor(destination) {
    super();
    this.logger = new LoggerWrapper(this.name);
    
    this._destination = destination;
    this.logger.debug(`destination: ${JSON.stringify(this._destination)}`);
    
    this._channel = (new AmqpConnectionManager()).channel;
    this.logger.debug(`got channel`);
  }

  publish(evt, dest = undefined) {
    const destination = dest || this._destination;
    this.logger.debug(`publishing to: ${JSON.stringify(destination)}`);

    this.logger.debug('check exchange');
    this._channel.checkExchange(destination.name)
      .then((res, err) => {
        if (err) {
          this.logger.error('** ' + err);
          return;
        }
        this.logger.debug(`check exchange ${destination.name} ok`);
        const result = this._channel.publish(destination.name, destination.route, new Buffer(JSON.stringify(evt)));
        this.logger.debug(`publish result: ${result}`);
      })
      .catch((err) => {
        this.logger.error(`AMQP exchange ${destination.name} does not exists. Error: ${err}`);
      })
  }
}

module.exports = AmqpPublisher;