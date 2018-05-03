/*!
 * node-mu
 * node.js minimalistic microservices framework on top of Express.js
 * 
 * Copyright(c) 2018 IT Resources s.r.l.
 * Copyright(c) 2018 Luca Stasio <luca.stasio@itresources.it>
 * 
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
 * 
 * lib/node-mu/config.js
 */

'use strict';

let _instance = null;

class Config {
  constructor(data) {
    if (!_instance) {
      this.data = data;
      _instance = this; 
    } else {
      return _instance;
    }
  }

  get configuration() {
    return this.data;
  }
}

module.exports = Config;
