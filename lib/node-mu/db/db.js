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
 * lib/node-mu/db/db.js
 */

'use strict';

const { LoggerWrapper } = require('../logger');
const Knex = require('knex');
const { Model } = require('objection');

class DbConnectionManager {
  constructor(knexConfig) {
    this.logger = new LoggerWrapper(this.constructor.name);
    this.logger.info('initializing Database Connection Manager');

    this._knexConfig = knexConfig;
    this.logger.debug('Knex configuration: ' + JSON.stringify(this._knexConfig));
  }

  async connect() {
    this.logger.debug('configuring database connection');
    return new Promise((resolve, reject) => {
      const knex = Knex(this._knexConfig);
      knex.raw('select 1 from dual').then(() => {
        this.logger.info('database connection established');
        resolve(knex);
      }).catch((err) => {
        this.logger.error('error connecting to database');
        reject(err);
      });
    });
  }

  async connectObjection() {
    try {
      const knexConnection = await this.connect();
      Model.knex(knexConnection);
      this.logger.info('Objection.js Model configured');
    } catch (error) {
      this.logger.error('error connecting to database and setting Objection Model');
      throw error;
    }
    
  }
}

module.exports = DbConnectionManager;