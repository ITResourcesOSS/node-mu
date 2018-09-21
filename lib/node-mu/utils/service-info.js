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
 * lib/node-mu/utils/service-info.js
 */

'use strict';

const config = require('config');
const os = require('os');

const env = process.env.NODE_ENV || 'development';

const version = `${config.get('service.version.major')}.${config.get('service.version.minor')}.${config.get('service.version.status')}`;
const name = `${config.get('service.group')}-${config.get('service.name')}-${env.substring(0, 3)}_${version}`;
const serviceName = config.get('service.name');
const serviceGroup = config.get('service.group');

const fullInfo = () => {
  const iocContainer = require('../ioc').container;
  const instanceId = iocContainer.get(APPLICATION_TYPE).id;
  const instanceName = `${instanceId}/${name}@${os.hostname()}`;
  return {serviceName, serviceGroup, name, instanceId, instanceName, version, env};
};
module.exports = {serviceName, serviceGroup, name, version, env, fullInfo};