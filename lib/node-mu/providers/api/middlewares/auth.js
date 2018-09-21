/*!
 * node-mu
 * node.js minimalistic microservices framework on top of Express.js
 *
 * Copyright(c) 2018 IT Resources s.r.l.
 * Copyright(c) 2018 Luca Stasio <joshuagame@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * See node-mu license text even in LICENSE file.
 *
 * lib/node-muproviders/api/middlewares/auth.js
 */

'use strict';

const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const passport = require('passport');
const { APIError } = require('../../../utils');


const handleJWT = (req, res, next, roles) => async (err, user, info) => {
  const error = err || info;
  const apiError = new APIError({
    message: error ? error.message : 'Unauthorized',
    status: httpStatus.UNAUTHORIZED,
    stack: error ? error.stack : undefined,
  });

  // TODO: check if this is better
  // if (error || !user) {
  //   return next(apiError);
  // }
  try {
    if (error || !user) {
      throw error;
    }
  } catch (err) {
    return next(apiError);
  }

  const hasRole = user.auth.some(role => {
    return roles.indexOf(role) > -1;
  });
  if (!hasRole) {
    apiError.stack = 'User role has no permission for path ' + req.path;
    return next(apiError);
  }

  req.user = user;

  return next();
};

// TODO: put roles in configuration file
exports.authorize = (roles = ['ROLE_ADMIN', 'ROLE_USER', 'ROLE_PARENT', 'ROLE_PEDIATRICIAN']) => (req, res, next) =>
  passport.authenticate(
    'jwt', { session: false },
    handleJWT(req, res, next, roles)
  )(req, res, next);