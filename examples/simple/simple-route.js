'use strict';

const { Route } = require('../../lib');
const path = '/simple';

class SimpleRoute extends Route {
  constructor() {
    super(path);
  }

  $setupRoutes() {
    this.addRoute('get', '/info', (req, res) => {
      //this.logger('request to get info');
      res.send(`this is the ${req.path} request handler`);
    });
  }
}

module.exports = SimpleRoute;