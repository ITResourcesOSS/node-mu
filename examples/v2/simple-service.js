const {container, injectable, component, application, inject} = require('../../lib').ioc;
const {DbConnectionManager, Api, AmqpConnectionManager, EventsEmitter} = require('../../lib').Providers;
//const {Model} = require('objection');
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
        }
      }
    )
  );