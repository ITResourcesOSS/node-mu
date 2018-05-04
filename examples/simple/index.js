'use strict';

const nodemu = require('../../lib');
const SimpleRoute = require('./simple-route');

Promise = require('bluebird');

class SimpleService extends nodemu.Service {
  constructor(basePath) {
    super(basePath);
  }

  $setupRoutes() {
    this.logger.info('setting up routes');
    const simpleRoute = new SimpleRoute();
    this.addRoute(simpleRoute);
  }
}

const start = async() => {
  try {
    console.log('Service initialization');
    const service = new SimpleService(__dirname);
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