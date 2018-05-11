'use strict';

const { ApiEventsEmitterController } = require('../../lib').Controllers;
const { AmqpPublisher } = require('../../lib');
const Hertzy = require('hertzy');
const dayjs = require('dayjs');

/* Here we use a simple array to simulate the DB */
let users = [
  { id: 1, username: 'frank.zappa', password: 'cuccurullo', login: 'joshuagame@gmail.com' },
  { id: 2, username: 'johnny', password: 'beegood', login: 'joshuagame@gmail.com' },
  { id: 3, username: 'joshuagame', password: 'shallweplayagame!', login: 'joshuagame@gmail.com' }
];

class UserController extends ApiEventsEmitterController {

  constructor() {
    super();
    this.logger.info('[*] User Controller initialized');
    this._logUsersDb();
  }

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
      const login = req.body.login;

      let lastId = users.length > 0 ? users[users.length-1].id : 0;
      const newUser = {id: ++lastId, username: username, password: password, login: login};
      users.push(newUser);
      
      const evt = {
        type: 'new_user_evt',
        spec: 'user_parent',
        producer: 'uaa-service',
        timestamp: dayjs(),
        mailto: newUser.login,
        payload: newUser
      };
      this.emit('new_user', evt);

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
      const login = req.body.login;
      this.logger.debug(`updating user id ${userId}`);
      for (let idx in users) {
        const user = users[idx];
        if (user.id == userId) {
          users[idx].username = username;
          users[idx].password = password;
          users[idx].login = login;

          const evt = {
            type: 'new_user_evt',
            spec: 'user_parent',
            producer: 'uaa-service',
            timestamp: dayjs(),
            mailto: users[idx].login,
            payload: users[idx]
          };
          this.emit('user_updated', evt);
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

          const evt = {
            type: 'new_user_evt',
            spec: 'user_parent',
            producer: 'uaa-service',
            timestamp: dayjs(),
            mailto: removedUser.login,
            payload: removedUser
          };
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