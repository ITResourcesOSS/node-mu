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
 * lib/node-mu/components/controllers/events-emitter.controller.js
 */

'use strict';

const Controller = require('./controller');
const Hertzy = require('hertzy');

/**
 * A base class to derive a controller which can emit events on an Hertzy events-channel.
 * Hertzy channels follows the Mediator desing pattern.
 * Using this base class the actual derived controller can emit events to the channel
 * and publish on an AMQP server staying decoupled from the AMQP Publisher.
 */
class EventsEmitterController extends Controller {

  /**
   * Initialize the controller with the events-channel.
   * @param {string} eventChannelName - The events-channel name.
   */
  constructor(eventChannelName = undefined) {
    super();

    this._eventChannelName = eventChannelName;
    if (this._eventChannelName) this._eventsChannel = Hertzy.tune(eventChannelName);
    this._logger.info('Hertzy API events channel initialized as "api-events"');
  }

  set eventChannelName(name) {
    this._eventChannelName = name;
    this.startEventChannel();
  }

  get eventChannelName() {
    return this._eventChannelName;
  }

  startEventChannel() {
    this._eventsChannel = Hertzy.tune(eventChannelName);
  }

  /**
   * Emit an event on the Event Channel. The event will be triggered by the service Events Emitter
   * which in turn will publish it on the configured AMQP Server (on exchange).
   *
   * @param {*} evt - The event name
   * @param {*} data - The event payload to be published into the AMQP server
   */
  emit(evt, data) {
    this._eventsChannel.emit(evt, data);
  }
}

module.exports = EventsEmitterController;
