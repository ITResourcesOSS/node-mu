/*!
 * node-mu
 * node.js minimalistic microservices framework on top of Express.js
 * 
 * Copyright(c) 2018 IT Resources s.r.l.
 * Copyright(c) 2018 Luca Stasio <luca.stasio@itresources.it>
 * 
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
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