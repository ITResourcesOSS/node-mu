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
