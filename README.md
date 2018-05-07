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

# Events map: i.e. "events-map.json"
EVENTS_MAP_FILE=set/here/your/json/file

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

events-map.json
````
{
    "events": [
        {
            "name": "new_user",
            "amqpConfig": {
                "exchange": {
                    "name": "uaa_events",
                    "route": "uaa_new_user_route"
                }
            }
        },
        {
            "name": "user_updated",
            "amqpConfig": {
                "exchange": {
                    "name": "uaa_events",
                    "route": "uaa_new_user_route"
                }
            }
        },
        {
            "name": "user_removed",
            "amqpConfig": {
                "exchange": {
                    "name": "uaa_events",
                    "route": "uaa_new_user_route"
                }
            }
        }
    ]
}
````

index.js
````
'use strict';

const { Service, AmqpPublisher, config } = require('../../lib');
const SimpleRoute = require('./simple-route');
const UserRoute = require('./user-route');

Promise = require('bluebird');

class SimpleService extends Service {
  constructor(basePath) {
    super(basePath);
  }

  $setupRoutes() {
    this.logger.info('setting up routes');
    
    const simpleRoute = new SimpleRoute();
    this.addRoute(simpleRoute);

    const userRoute = new UserRoute();
    this.addRoute(userRoute);    
  }
}

const start = async() => {
  try {
    console.log('Service initialization');
    const service = new SimpleService(__dirname);
    console.log
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

const { Route } = require('../../lib');
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
      return res.json({ controller: 'SimpleController', version: '2.0' });
    } catch (err) {
      return next(err);
    }
    
  }
}

module.exports = SimpleController;
````

user-route.js
````
'use strict';

const { Route } = require('../../lib');
const UserController = require('./user-controller');

const path = '/users';

class UserRoute extends Route {
  constructor() {
    super(path);
    this.logger.info('[*] UserRoute initialized');
  }

  $setupRoutes() {
    const userController = new UserController();
    this.addRoute('get', '/', userController.getUsers);
    this.addRoute('post', '/', userController.addUser);
    this.addRoute('put', '/:userId', userController.updateUser);
    this.addRoute('delete', '/:userId', userController.deleteUser);
  }
}

module.exports = UserRoute;
````

simple-controller.js
````
'use strict';

const { ApiEventsEmitterController } = require('../../lib').Controllers;
const { AmqpPublisher } = require('../../lib');
const Hertzy = require('hertzy');

/* Here we use a simple array to simulate the DB */
let users = [
  { id: 1, username: 'frank.zappa', password: 'cuccurullo' },
  { id: 2, username: 'johnny', password: 'beegood' },
  { id: 3, username: 'joshuagame', password: 'shallweplayagame!' }
];

class UserController extends ApiEventsEmitterController {

  constructor() {
    super();
    this.logger.info('[*] User Controller initialized');
    this._logUsersDb();
  }

//this.emit('new_user', { id: 123, username: 'frank.zappa' });

  async getUsers(req, res, next) {
    try {
      this.logger.debug('[*] Request to get Users');
      this._logUsersDb();
      // here you should have an AWAIT get on the DB.
      return res.json(users);
    } catch (err) {
      return next(err);
    }
  }

  async addUser(req, res, next) {
    try {
      const username = req.body.username;
      const password = req.body.password;

      let lastId = users.length > 0 ? users[users.length-1].id : 0;
      const newUser = {id: ++lastId, username: username, password: password};
      users.push(newUser);
      
      this.emit('new_user', newUser);

      this._logUsersDb();
      return res.json(users);
    } catch (err) {
      return next(err);
    }
  }

  async updateUser(req, res, next) {
    try {
      const userId = req.params.userId;
      const username = req.body.username;
      const password = req.body.password;
      this.logger.debug(`updating user id ${userId}`);
      for (let idx in users) {
        const user = users[idx];
        if (user.id == userId) {
          users[idx].username = username;
          users[idx].password = password;

          this.emit('user_updated', users[idx]);
          break;
        }
      }
      
      this._logUsersDb();
      return res.json(users);
    } catch (err) {
      return next(err);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const userId = req.params.userId;
      for (let idx in users) {
        const user = users[idx];
        if (user.id == userId) {
          const removedUser = users[idx];
          users.splice(idx, 1);

          this.emit('user_removed', removedUser);
          break;
        }
      }

      this._logUsersDb();
      return res.json(users);
    } catch (err) {
      return next(err);
    }
  }

  _logUsersDb() {
    this.logger.debug(`users: ${JSON.stringify(users, undefined, 2)}`);
  }
}

module.exports = UserController;
````

### License
Licensed under [MIT license](https://github.com/ITResourcesOSS/node-mu/blob/master/LICENSE)