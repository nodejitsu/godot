/*
 * within.js: Stream responsible for emitting events if they fall within a given inclusive range.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var util = require('util'),
    ReadWriteStream = require('../common/read-write-stream');

//
// ### function Within (mix, max)
// #### @min {number} Floor value to compare to `.metric` values.
// #### @max {number} Ceiling value to compare to `.metric` values.
// Constructor function of the Over stream responsible for emitting
// events if they fall within a given inclusive range {min, max}.
//
var Within = module.exports = function (min, max) {
  if (!(this instanceof Within)) { return new Within(min, max) }
  if (typeof min !== 'number' || typeof max !== 'number') {
    throw new Error('ceiling is required.');
  }

  ReadWriteStream.call(this);
  this.min = min;
  this.max = max;
};

//
// Inherit from ReadWriteStream
//
util.inherits(Within, ReadWriteStream);

//
// ### function write (data)
// #### @data {Object} JSON to filter
// Emits data only if `.metric` is under `this.max`
// and over `this.min`.
//
Within.prototype.write = function (data) {
  if (typeof data.metric !== 'number') {
    return;
  }
  else if (this.max >= data.metric && this.min <= data.metric) {
    this.emit('data', data);
  }
};
