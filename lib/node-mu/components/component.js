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
 * lib/node-mu/components/component.js
 */

'use strict';

const uuidv1 = require('uuid/v1');
const {LoggerWrapper} = require('../logger');

/**
 * A component class which generates and maintain an instance id.
 * Actually used only by the AmqpProducer instance classes.
 */
class Component {

  /**
   * Initialize the component generating an uuid v1 code and grabbing the only the first part,
   * and storing the class instance full name into an internal const.
   */
  constructor(ctype = 'component') {
    this._id = uuidv1().split('-')[0];
    this._name = this.constructor.name + '-' + this._id;
    this._ctype = ctype;
    this._logger = new LoggerWrapper(this.constructor.name, this._id);
  }

  /**
   * Returns the instance id
   * @return {number} _id - The instance id number.
   */
  get id() {
    return this._id;
  }

  /**
   * Returns the full class instance name.
   * @return {string} _name - The instance class name.
   */
  get name() {
    return this._name;
  }

  get ctype() {
    return this._ctype;
  }
}

module.exports = Component;
