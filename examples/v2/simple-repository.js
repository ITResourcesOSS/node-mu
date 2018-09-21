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