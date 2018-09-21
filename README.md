## node-mu

A node.js minimalistic microservice framework. At this stage node-mu it is not yet production-ready. It is under heavy testing.

### Release notes
As of this 0.1.1 version, we introduce Inversion of Control using the [inversify](https://github.com/inversify) IoC container library.

We introduce the new _Producer_ and _Service_ concept.
All of the _node-mu_ components are now _injectable_ thanks to the relative decorator functions:

* _injectable_
* _componente_
* _provider_
* _route_
* _controller_
* _service_
* _repository_
* _factoryFunction_
* _application_
* _inject_

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

config/default.yml
````
########################################################################
# Service configuration.
#
# This configuration will be overridden by the NODE_ENV profile you use,
# for example development.yml for development profile or production.yml
# for production a so on.
#
########################################################################

service:
  group: Examples
  name: SimplerService
  version:
    major: 0
    minor: 0
    status: 0   # 0: alpha, 1: beta, 2: release, 3: final

api:
  endpoint:
    port: 5001
    baseRoutingPath: /api/v2
  security:
    enabled: true
    jwt:
      secret: configure-here-jwt-secret-for-the-service
      expiration:
        enabled: true
        minutes: 13149000

management:
  endpoint:
    port: 5101
    baseRoutingPath: /mgmt
  health:
    path: /health
    full: true


jwt:
  secret: configure-here-jwt-secret-for-the-service
  expiration:
    enabled: true
    minutes: 13149000

# optional configuration to open a db connection
db:
  client: mysql2
  connection:
    host: set-here-the-host-of-your-db
    database: set-here-the-name-of-your-db-schema
    user: set-here-the-user-name
    password: set-here-the-user-password
    charset: utf8

# optional configurtion to open and AMQP connection
amqp:
  url: amqp://set-here-a-user:set-here-a-pwd@set-here-the-host:5672/set-here-a-VHOST
  exchange:
    name: set_here_the_name_of_an_exchange

events:
  mapFile: set/here/your/json/file

log:
  path: ../path/for/log/file
  console: true|false
  level: set-here-your-log-level_(INFO,DEBUG,...)
  json: true|false
  requests:
    console: true|false
  errors:
    console: true|false


# should match your Git repo version
info:
  version: your.service.version
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
```javascript
const build = require('../../lib');
const SimpleService = require('./simple-service');

const start = async () => {;
  try {
    const service = build(SimpleService);
    await service.run();
  } catch (err) {
    throw err;
  }
};

start()
  .then(() => {
    console.log(`\uD83D\uDE80  node-\u03BC service started [pid: ${process.pid}]... bring me some \uD83C\uDF7A \uD83C\uDF7A \uD83C\uDF7A`);
  }).catch((err) => {
  console.error(`\uD83D\uDD25  service crashed at startup: ${err}`);
  process.exit(1);
});
```

simple-service.js
```javascript
const {container, injectable, component, application, inject} = require('../../lib').ioc;
const {DbConnectionManager, Api, AmqpConnectionManager, EventsEmitter} = require('../../lib').Providers;
const Application = require('../../lib').Application;
const SimpleRoute = require('./simple-route');

module.exports =
  inject([
      DbConnectionManager,
      AmqpConnectionManager,
      EventsEmitter,
      Api
    ],
    application(
      class SimpleService extends Application {
        constructor(dbConnectionManager, amqpConnectionManager, eventsEmitter, api) {
          super();
          this.dbConnectionManager = dbConnectionManager;
          this.amqpConnectionManager = amqpConnectionManager;
          this.eventsEmitter = eventsEmitter;
          this.api = api;
          this._logger.info('SimpleServie started');
        }

        $bootstrap() {
          // DO HERE WHAT YOU NEED DURING SERVICE INITIALIZATION
        }
      }
    )
  );
```

simple-route.js
```javascript
'use strict';

const { inject, route } = require('../../lib').ioc;
const { Route } = require('../../lib');
const SimpleController = require('./simple-controller');
const Joi = require('joi');

const path = '/simple';

module.exports =
  inject(
    [SimpleController],
    route(
      class SimpleRoute extends Route {
        constructor(simpleController) {
          super(path);
          this._simpleController = simpleController;

          this._setRoutes();
        }

        _setRoutes() {
          this.route('/simple').get('/info', this._simpleController.info);

          this.route('/complex', {
              '/first': {
                method: ['POST'],
                headers: {
                  'host': Joi.string().required(),
                  'user-agent': Joi.string().required()
                },
                body: {
                  username: Joi.string().required()
                }
              }
            }
          ).post('/first', (req, res) => {
            this._logger.debug('****** VALIDATION OK: ' + req.body.username);
            res.send(req.body.username);
          }).get('/first', (req, res) => {
            res.send('/first endpoint OK');
          });
        }
      }
    )
  );
```

simple-controller.js
```javascript
'use strict';

const {inject, controller} = require('../../lib').ioc;
const {ApiEventsEmitterController} = require('../../lib').Controllers;
const SimpleBusinessService = require('./services/simple-business-service');

module.exports =
  inject(
    [SimpleBusinessService],
    controller(
      class SimpleController extends ApiEventsEmitterController {
        constructor(simpleBusinessService) {
          super();
          this._simpleBusinessService = simpleBusinessService;
        }

        async info(req, res, next) {
          this._logger.info('Request to get info');
          try {
            const info = await this._simpleBusinessService.info();
            res.json(info);
          } catch (err) {
            this._logger.error(err);
            next(err);
          }
        }
      }
    )
  );
```

services/simple-business-service.js
```javascript
'use strict'

const { inject, service } = require('../../../lib').ioc;
const { Service } = require('../../../lib');
const SimpleRepository = require('../simple-repository');

module.exports =
  inject(
    [SimpleRepository],
    service(
      class SimpleBusinessService extends Service  {
        constructor(simpleRepository) {
          super();
          this._simpleRepository = simpleRepository;
        }

        async info() {
          return new Promise(async (resolve, reject) => {
            try {
              const user = await this._simpleRepository.findOne({login: 'jstest2111111111111'}, ['authorities']);
              console.log('\n\nUSER: ' + JSON.stringify(user, null, 2) + '\n\n');
              resolve(user);
            } catch (err) {
              reject(err);
            }
          });
        }
      }
    )
  );
```

user-model.js
```javascript
'use strict';

const Model = require('objection').Model;
const Authority = require('./authority-model');


class User extends Model {

  static get tableName() {
    return 'USERS';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['login', 'activated', 'created_by', 'created_date'],
      properties: {
        id: { type: 'bigInteger' },
        login: { type: 'string', minLength: 1, maxLength:50 },
        password_hash: { type: 'string', minLength: 1, maxLength: 60 },
        first_name: { type: 'string', minLength: 1, maxLength: 50 },
        last_name: { type: 'string', minLength: 1, maxLength: 50 },
        email: { type: 'string', minLength: 7, maxLength: 100 },
        image_url: { type: 'string', minLength: 1, maxLength: 256 },
        activated: { type: 'bit'},
        lang_key: { type: 'string', minLength: 2, maxLength: 6 },
        activation_key: { type: 'string', minLength: 1, maxLength: 20 },
        reset_key: { type: 'string', minLength: 1, maxLength: 20 },
        created_by: { type: 'string', minLength: 1, maxLength: 50 },
        created_date: { type: 'timestamp' },
        reset_date: { type: 'timestamp' },
        last_modified_by: { type: 'string', minLength: 1, maxLength: 50 },
        last_modified_date: { type: 'timestamp' }
      }
    };
  }

  static get relationMappings() {
    return {
      authorities: {
        relation: Model.ManyToManyRelation,
        modelClass: Authority,
        join: {
          from: 'user.id',
          through: {
            from: 'user_authority.user_id',
            to: 'user_authority.authority_name'
          },
          to: 'authority.name'
        }
      }
    };
  }

}

module.exports = User;
```

authority-model.js
```javascript
'use strict';

const Model = require('objection').Model;

class Authority extends Model {

  static get tableName() {
    return 'AUTHORITIES';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 50 }
      }
    };
  }

  static get relationMappings() {
    return {
      users: {
        relation: Model.ManyToManyRelation,
        modelClass: __dirname + '/user-model',
        join: {
          from: 'authority.name',
          through: {
            from: 'user_authority.authority_name',
            to: 'user_authority.user_id'
          },
          to: 'user.id'
        }
      }
    };
  }
}

module.exports = Authority;
```

simple-repository.js
```javascript
'use strict';

const {repository} = require('../../lib').ioc;
const {Repository} = require('../../lib');
const User = require('./user-model');

module.exports =
  repository(
    class SimpleRepository extends Repository {
      constructor() {
        super(User);
      }
    }
  );
```


### License
Licensed under the [MIT license](https://github.com/ITResourcesOSS/node-mu/blob/master/LICENSE).