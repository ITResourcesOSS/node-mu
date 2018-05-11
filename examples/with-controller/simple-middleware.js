'use strict';

module.exports = (req, res, next) => {
  console.log('**** simple do nothing middleware ****');
  next();
};