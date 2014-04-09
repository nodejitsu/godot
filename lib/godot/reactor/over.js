/*
 * over.js: Stream responsible for emitting events over a fixed value.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var util = require('util'),
    ReadWriteStream = require('../common/read-write-stream');

//
// ### function Over (ceiling)
// #### @ceiling {number} Ceiling value to compare to `.metric` values.
// Constructor function of the Over stream responsible for emitting
// events over a fixed value.
//
var Over = module.exports = function (ceiling) {
  if (!(this instanceof Over)) { return new Over(ceiling) }
  if (!ceiling) {
    throw new Error('ceiling is required.');
  }

  ReadWriteStream.call(this);
  this.ceiling = ceiling;
};

//
// Inherit from ReadWriteStream
//
util.inherits(Over, ReadWriteStream);

//
// ### function write (data)
// #### @data {Object} JSON to filter
// Emits data only if `.metric` is over `this.ceiling`.
//
Over.prototype.write = function (data) {
  if (data.metric > this.ceiling) {
    this.emit('data', data);
  }
};
