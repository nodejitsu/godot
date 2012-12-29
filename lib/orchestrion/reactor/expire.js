/*
 * expire.js: Stream for filtering expired TTLs.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var stream = require('stream'),
    util = require('util');

var Expire = module.exports = function (options) {
  stream.Stream.call(this);
};

util.inherits(Expire, stream.Stream);