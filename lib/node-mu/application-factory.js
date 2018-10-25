'use strict';

const { Component } = require('./components');
const { container } = require('./ioc');
const {LoggerWrapper} = require('./logger');
const logger = new LoggerWrapper('ApplicationFactory');

module.exports = class ApplicationFactory extends Component {
  static create(applicationClass) {
    logger.info('starting service', true);

    const iocId = Reflect.getMetadata('node-mu:iocId', applicationClass);
    const application = container.get(iocId);
    logger.info(`service Application instance [${application.id}] builded`, true);
    return application;
  }
};