'use strict';

const { Service, AmqpPublisher } = require('../../lib');
const SimpleRoute = require('./simple-route');

Promise = require('bluebird');

class SimpleService extends Service {
  constructor(basePath) {
    super(basePath);
  }

  $setupRoutes() {
    this.logger.info('setting up routes');
    const simpleRoute = new SimpleRoute();
    this.addRoute(simpleRoute);
    
    /*const evt = {
      type: 'new_user',
      data: {
        id: 12,
        username: 'joshuagame'
      }
    };
    this.emit(evt);*/
  }

  /*
  emit(evt) {
    this.amqpConnectionManager.channel.publish('uaa_events', 'uaa_new_user_route', new Buffer(JSON.stringify(evt)));
  }
  */
}

const start = async() => {
  try {
    console.log('Service initialization');
    const service = new SimpleService(__dirname);
    service.on('amqp-connection-ok', () => {
      const amqpPublisher = new AmqpPublisher({
        type: 'exchange',
        exchange: {
          name: 'exchange-name',
          route: 'route-name'
        }
      });
    });
    await service.start();
  } catch(err) {
    throw err;
  }
};

start()
  .then(() => {
    console.log('\uD83D\uDC4D service started... bring me some \uD83C\uDF7A\uD83C\uDF7A\uD83C\uDF7A');
  }).catch((err) => {
  console.error(`service crashed at startup: ${err}`);
  process.exit(1);
});