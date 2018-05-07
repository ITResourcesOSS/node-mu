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
 * lib/node-mu/events-emitter/events-emitter.js
 */

'use strict';

const { LoggerWrapper } = require('../logger');
const Hertzy = require('hertzy');
const { AmqpPublisher } = require('../amqp');

const apiEvents = Hertzy.tune('api-events');

/** The application Events Emitter. For each of the registered events can publish messeages on AMQP exchanges. */
class EventsEmitter {
  constructor() {
    this.logger = new LoggerWrapper(this.constructor.name);
    this._eventsMap = new Map();
  }

  /** Register events with their relative AMQP Publisher into the <evt;publisher> Map. */
  registerEvents(eventsConfigMap) {
    this._eventsConfigMap = eventsConfigMap;
    this.logger.debug(`**** events config map: ${JSON.stringify(this._eventsConfigMap, undefined, 2)}`);
    
    for (const evt of this._eventsConfigMap) {
      // initialize Publisher and add to the <evt;publisher> map
      const amqpPublisher = new AmqpPublisher(evt.amqpConfig.exchange);
      this._eventsMap.set(evt.name, amqpPublisher);

      this.logger.debug(`**** registering event ${evt.name} on events-channel "api-events"`);
      // evt callback to publish evt on AMQP queue
      apiEvents.on(evt.name, (data) => {
        this.logger.debug(`got event ${evt.name} with data ${JSON.stringify(data)}`);

        try {
          const amqpPublisher = this._eventsMap.get(evt.name);
          amqpPublisher.publish({ type: evt.name, payload: data });
          this.logger.info(`${evt.name} event published on AMQP exchange`);
        } catch (err) {
          this.logger.error(`error sending event ${evt.name} - ${JSON.stringify(data)} - error: ${err}`);
        }
        
      });

      this.logger.info(`event: ${JSON.stringify(evt)} registered`);
    }
  }

  /**
   * Returns the <event;publisher> Map.
   * @return {Map} _eventsMap - The <event;publisher> Map.
   */
  get eventsMap() {
    return this._eventsMap;
  }

  /**
   * Returns the events configuration.
   * @return {object} _eventsConfigMap - The events configuration data structure.
   */
  get eventsConfigMap() {
    return this._eventsConfigMap;
  }
}

module.exports = EventsEmitter;