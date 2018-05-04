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

.env
````
# environment
NODE_ENV=development

# REST API server port
PORT=5005
BASE_ROUTING_PATH=/set/here/api/base/routing/path

# service info
SERVICE_GROUP=ServiceGroupName
SERVICE_NAME=ServiceName
SERVICE_VERSION_MAJOR=1
SERVICE_VERSION_MINOR=0
# 0: alpha - 1: beta - 2: release - 3: final
SERVICE_VERSION_STATUS=0

# Authentication JWT secret
JWT_SECRET=configure-here-jwt-secret-for-the-service
JWT_EXPIRATION_MINUTES=13149000

# MySQL connection
DB_CLIENT=mysql2
DB_NAME=set-here-the-name-of-your-db-schema
DB_HOST=set-here-the-host-of-your-db
DB_USER=set-here-the-user-name
DB_PWD=set-here-the-user-password
DB_CHARSET=utf8|...

# AMQP connection
AMQP_URL=amqp://set-here-a-user:set-here-a-pwd@set-here-the-host:5672/set-here-a-VHOST
AMQP_URL_TESTS=amqp://set-here-a-TEST-user:set-here-a-pwd@set-here-the-TEST-host:5672/set-here-a-TEST-VHOST
AMQP_EXCHANGE_NAME=set_here_the_name_of_an_exchange

# logging
LOG_PATH=../path/for/log/file
LOG_CONSOLE=true-or-false
LOG_FILE=set-here-your-log-file-name.log
LOG_LEVEL=set-here-your-log-level_(INFO,DEBUG,...)
LOG_JSON=true-or-false
LOG_REQUESTS_CONSOLE=true-or-false
LOG_REQUESTS_FILE=set-her-your-log-file-for-requests-logs.log
LOG_ERRORS_CONSOLE=true-or-false
````



index.js
````
'use strict';

const { Service } = require('node-mu');
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
````

simple-route.js
````
'use strict';

const { Route } = require('node-mu');
const SimpleController = require('./simple-controller');

const path = '/simple';

class SimpleRoute extends Route {
  constructor() {
    super(path);
    this.logger.info('[*] SimpleRoute initialized');
  }

  $setupRoutes() {
    const simpleController = new SimpleController();
    this.addRoute('get', '/info', simpleController.info);
    this.logger.debug('[*] /info route configured');
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
    this.logger.info('[*] Simple Controller initialized');
  }

  info(req, res) {
    this.logger.debug('[*] Request to get controller information');
    res.json({ controller: 'SimpleController', version: '1.0' });
  }
}

module.exports = SimpleController;
````

