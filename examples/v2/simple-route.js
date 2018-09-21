'use strict';

const { inject, route } = require('../../lib').ioc;
const { Route } = require('../../lib');
const SimpleController = require('./simple-controller');
const { AuthMiddleware } = require('../../lib').Providers;
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