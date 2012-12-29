/*
 * where.js: Stream for filtering events based on properties.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var stream = require('stream'),
    util = require('util');

var Where = module.exports = function (options) {
  stream.Stream.call(this);
};

util.inherits(Where, stream.Stream);