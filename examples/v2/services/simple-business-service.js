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

        /*
        async info() {
          return new Promise(async resolve => {
            resolve('SIMPLE-BUSIONESS-SERVICE');
          });
        }
        */

      }
    )
  );

