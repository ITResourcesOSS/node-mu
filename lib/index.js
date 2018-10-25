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
 * lib/index.js
 */

'use strict';

// yeah, I know... it's a global! ... go on :)!
Promise = require('bluebird');

require('reflect-metadata');
const ioc = require('./node-mu/ioc');
const Application = require('./node-mu/application');
const ApplicationFactory = require('./node-mu/application-factory');

module.exports = {
  ioc,
  ApplicationFactory,
  Application,
  Providers: require('./node-mu/providers'),
  Controllers: require('./node-mu/components').Controllers,
  Route: require('./node-mu/components').Route,
  Component: require('./node-mu/components').Component,
  Repository: require('./node-mu/components').Repository,
  Service: require('./node-mu/components').Service,
  Utils: require('./node-mu/utils')
};
