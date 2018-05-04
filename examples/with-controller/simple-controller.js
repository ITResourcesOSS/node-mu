'use strict';

const { Controller } = require('../../lib');
const { AmqpPublisher } = require('../../lib');

class SimpleController extends Controller {
  constructor() {
    super();
    this.logger.info('[*] Simple Controller initialized');
    this.amqpPublisher = new AmqpPublisher({
      type: 'exchange',
      exchange: {
        name: 'exchange-name',
        route: 'route-name2'
      }
    });
  }

  info(req, res) {
    this.logger.debug('[*] Request to get controller information');
    res.json({ controller: 'SimpleController', version: '1.0' });
  }
}

module.exports = SimpleController;