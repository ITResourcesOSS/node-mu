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
 * lib/node-mu/providers/db/db-connection-manager.provider.js
 */

'use strict';

const {provider} = require('../../ioc');
const Provider = require('../provider');
const config = require('config');
const Knex = require('knex');
const {Model} = require('objection');

module.exports =
  provider(
    class DbConnectionManager extends Provider {
      constructor() {
        super();
      }

      init(model) {
        this._model = model;
      }

      async $start() {
        try {
          this._knexConfig = config.get('db');
          this._logger.debug(`configuration: ${JSON.stringify(this._knexConfig)}`);

          this.init(Model);

          const knexConnection = await this.connect();
          this._model.knex(knexConnection);
        } catch (err) {
          throw err;
        }
      }

      async $stop() {
      }

      async connect() {
        this._logger.debug('configuring database connection');
        return new Promise((resolve, reject) => {
          this._knex = Knex(this._knexConfig);
          this._knex.raw('select 1 from dual').then(() => {
            this._logger.info('database connection established');
            resolve(this._knex);
          }).catch((err) => {
            this._logger.error('error connecting to database');
            reject(err);
          });
        });
      }

      get knex() {
        this._logger.debug('returning Knex instance');
        return this._knex;
      }

      get $healthId() {
        return 'db';
      }

      $isCheckableForHealth() {
        return true;
      }

      async $health() {
        return new Promise((resolve, reject) => {
          this._logger.debug('***** db health');
          this._knex.raw('select 1 from dual').then(() => {
            this._logger.debug('****database connection established');
            resolve({status: 'UP'});
          }).catch((err) => {
            this._logger.error('****error connecting to database');
            reject({status: 'DOWN', message: err.stack});
          });
        });
      }

      get model() {
        return this._model;
      }
    }
  );
