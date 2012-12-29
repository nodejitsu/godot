/*
 * expire.js: Stream for filtering changes to properties on events.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var stream = require('stream'),
    util = require('util');

var Change = module.exports = function (options) {
  stream.Stream.call(this);
};

util.inherits(Change, stream.Stream);