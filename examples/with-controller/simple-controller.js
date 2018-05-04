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
        name: 'uaa_events2',
        route: 'uaa_new_user_route'
      }
    });
  }

  info(req, res, next) {
    try {
      this.logger.debug('[*] Request to get controller information');
      

      try {
        this.amqpPublisher.publish({
          type: 'new_user',
          data: {
            id: 12,
            username: 'joshuagame'
          }
        });
      } catch (err) {
        this.logger.error(`error sending event: ${err}`);
      }
      

      return res.json({ controller: 'SimpleController', version: '2.0' });
    
    } catch (err) {
      return next(err);
    }
    
  }
}

module.exports = SimpleController;