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