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
 * lib/node-mu/utils/response-utils.js
 */

'use strict';

const httpStatus = require('http-status');

// Response error Utils

const badRequestError = (message) => {
  return errorDescription(httpStatus.BAD_REQUEST, true, message);
};

const unauthorizedError = (message = 'Unauthorized: incorrect username or password.') => {
  return errorDescription(httpStatus.UNAUTHORIZED, true, message);
};

const errorDescription = (status, isPublic, message) => {
  return {
    status: status,
    isPublic: isPublic,
    message: message
  }
};

// Headers Utils

const getPagingParams = (req) => {
  const page = req.query.page || 0;
  const size = req.query.size || 0;
  const sort = req.query.sort;
  let sortField = 'id';
  let sortDirection = 'asc';
  if (sort && sort.indexOf(',') > -1) {
    const splitted = sort.split(',');
    sortField = splitted[0].trim();
    sortDirection = splitted[1].trim();
  }

  return {
    page,
    size,
    sortField,
    sortDirection
  }
};

const setPagingHeaders = (res, data, page, size, baseUrl) => {
  const totalCount = Number.parseInt(data.total || data.length, 10);
  res.set('X-Total-Count', data.total || data.length);

  const _page = Number.parseInt(page, 10);
  const _size = Number.parseInt(size, 10);

  let totalPages = Math.ceil(totalCount / size);

  let link = '';
  if ((page + 1) < totalPages) {
    link = `<${baseUrl}?page=${_page + 1}&size=${_size}>; rel="next",`;
  }

  if (page > 0) {
    link += `<${baseUrl}?page=${_page - 1}&size=${_size}>; rel="prev",`;
  }

  let lastPage = 0;
  if (totalPages > 0) {
    lastPage = totalPages - 1;
  }

  link += `<${baseUrl}?page=${lastPage}&size=${_size}>; rel="last",`;
  link += `<${baseUrl}?page=0&size=${_size}>; rel="first"`;
  res.set('link', link);
};

module.exports = {badRequestError, unauthorizedError, errorDescription, getPagingParams, setPagingHeaders};