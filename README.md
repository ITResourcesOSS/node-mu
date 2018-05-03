## node-mu

A node.js minimalistic microservice framework. At this stage node-mu it is not yet production-ready. It is under heavy testing.

### Installation
Using npm:
````
$ npm install --save node-mu
````
using Yarn:
````
$ yarn add node-mu
````

### Example

index.js
````
'use strict';

const nodemu = require('node-mu');
const SimpleRoute = require('./simple-routes');

Promise = require('bluebird');

class TestService extends nodemu.Service {
  constructor(serviceBasePath) {
    super(serviceBasePath);
  }

  $setupRoutes() {
    this.logger.info('setting up routes');
    const route = new SimpleRoute();
    this.addRoute(simpleRoute);
  }
}


const start = async() => {
  try {
    console.log('Service initialization');
    const service = new TestService(__dirname);
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
````

simple-routes.js
````
'use strict';

const { Route } = require('node-mu');
const SimpleController = require('./simple-controller');

const path = '/simple';

class SimpleRoute extends Route {
  constructor() {
    super(path);
  }

  $setupRoutes() {
    const controller = new SimpleController();
    this.addRoute('get', '/info', controller.info);
  }

}

module.exports = SimpleRoute;
````

simple-controller.js
````
'use strict';

const { Controller } = require('node-mu');

class SimpleController extends Controller {
  constructor() {
    super();
    this.logger.info('Simple controller initialized');
  }

  info(req, res) {
    res.json({ controller: 'SimpleController', version: '1.0' });
  }

}

module.exports = SimpleController;
````

