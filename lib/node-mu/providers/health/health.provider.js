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
 * lib/node-mu/providers/health/index.js
 */

'use strict';

const {provider, container} = require('../../ioc');
const Provider = require('../provider');
const ProvidersRegister = require('./providers-register');
const autoBind = require('auto-bind');
const moment = require('moment');

module.exports =
  provider(
    class Health extends Provider {
      constructor() {
        super();
        autoBind(this);
      }

      async $start(providersIds) {
        if (providersIds) {
          ProvidersRegister.registerAll(providersIds);
        }

        this._logger.info('providers list set');
      }

      async $stop() {
        this._logger.debug('IMPLEMENT Health Provider stop functionality');
      }

      async health() {
        return new Promise(async (resolve) => {
          this._logger.info('composing health info');
          const uptime = Math.floor(process.uptime());
          let healthResponse = {
            status: 'UP',
            starttime: moment().subtract(uptime, 'seconds').format(),
            uptime: uptime,
            timestamp: moment().format()
          };

          for (let providerIocId of ProvidersRegister.ids) {
            try {
              const provider = container.get(providerIocId);
              if (provider.$isCheckableForHealth()) {
                this._logger.debug(`getting health info for ${providerIocId} Provider`);
                let healthMsg = {};
                try {
                  healthMsg = await provider.$health();
                } catch (err) {
                  healthMsg = err;
                }

                healthResponse[provider.$healthId] = healthMsg;
                this._logger.debug(`${providerIocId} Provider health response: ${JSON.stringify(healthMsg)}`);
              } else {
                this._logger.debug(`${providerIocId} Provider has not been set has health checkable`);
              }
            } catch (err) {
              this._logger.warn(`unable to get health info for ${providerIocId} Provider`);
            }
          }

          this._logger.info(`health info: ${JSON.stringify(healthResponse)}`);
          resolve(healthResponse);
        });

      }
    }
  );


