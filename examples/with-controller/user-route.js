'use strict';

const { Route } = require('../../lib');
const UserController = require('./user-controller');

const path = '/users';

class UserRoute extends Route {
  constructor() {
    super(path);
    this.logger.info('[*] UserRoute initialized');
  }

  $setupRoutes() {
    const userController = new UserController();
    this.addRoute('get', '/', userController.getUsers);
    this.addRoute('post', '/', userController.addUser);
    this.addRoute('put', '/:userId', userController.updateUser);
    this.addRoute('delete', '/:userId', userController.deleteUser);
  }
}

module.exports = UserRoute;