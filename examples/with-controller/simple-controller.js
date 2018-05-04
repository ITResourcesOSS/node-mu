'use strict';

const { Controller } = require('../../lib');

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