/*
 * forward.js: Stream for forwarding events to another remote server.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var stream = require('stream'),
    util = require('util');

var Forward = module.exports = function (options) {
  stream.Stream.call(this);
};

util.inherits(Forward, stream.Stream);