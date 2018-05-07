'use strict';

const { Controller } = require('../../lib').Controllers;
const { AmqpPublisher } = require('../../lib');
const Hertzy = require('hertzy');

class SimpleController extends Controller {
  constructor() {
    super();
    this.logger.info('[*] Simple Controller initialized');
  }

  async info(req, res, next) {
    try {
      this.logger.debug('[*] Request to get controller information');

      //this.emit('new_user', { id: 123, username: 'frank.zappa' });

      return res.json({ controller: 'SimpleController', version: '2.0' });

    
    } catch (err) {
      return next(err);
    }
    
  }
}

module.exports = SimpleController;