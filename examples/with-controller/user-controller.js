'use strict';

const { ApiEventsEmitterController } = require('../../lib').Controllers;
const { AmqpPublisher } = require('../../lib');
const Hertzy = require('hertzy');

let users = [
  { id: 1, username: 'frank.zappa', password: 'cuccurullo' },
  { id: 2, username: 'johnny', password: 'beegood' },
  { id: 3, username: 'joshuagame', password: 'shallweplayagame!' }
];

class UserController extends ApiEventsEmitterController {

  constructor() {
    super();
    this.logger.info('[*] User Controller initialized');
    this._logUsersDb();
  }

//this.emit('new_user', { id: 123, username: 'frank.zappa' });

  async getUsers(req, res, next) {
    try {
      this.logger.debug('[*] Request to get Users');
      this._logUsersDb();
      // here you should have an AWAIT get on the DB.
      return res.json(users);
    } catch (err) {
      return next(err);
    }
  }

  async addUser(req, res, next) {
    try {
      const username = req.body.username;
      const password = req.body.password;

      let lastId = users.length > 0 ? users[users.length-1].id : 0;
      const newUser = {id: ++lastId, username: username, password: password};
      users.push(newUser);
      
      this.emit('new_user', newUser);

      this._logUsersDb();
      return res.json(users);
    } catch (err) {
      return next(err);
    }
  }

  async updateUser(req, res, next) {
    try {
      const userId = req.params.userId;
      const username = req.body.username;
      const password = req.body.password;
      this.logger.debug(`updating user id ${userId}`);
      for (let idx in users) {
        const user = users[idx];
        if (user.id == userId) {
          users[idx].username = username;
          users[idx].password = password;

          this.emit('user_updated', users[idx]);
          break;
        }
      }
      
      this._logUsersDb();
      return res.json(users);
    } catch (err) {
      return next(err);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const userId = req.params.userId;
      for (let idx in users) {
        const user = users[idx];
        if (user.id == userId) {
          const removedUser = users[idx];
          users.splice(idx, 1);

          this.emit('user_removed', removedUser);
          break;
        }
      }

      this._logUsersDb();
      return res.json(users);
    } catch (err) {
      return next(err);
    }
  }

  _logUsersDb() {
    this.logger.debug(`users: ${JSON.stringify(users, undefined, 2)}`);
  }
}

module.exports = UserController;