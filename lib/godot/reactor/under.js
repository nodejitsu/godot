/*
 * under.js: Stream responsible for emitting events under a fixed value.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var util = require('util'),
    ReadWriteStream = require('../common/read-write-stream');

//
// ### function Over (floor)
// #### @floor {number} Floor value to compare to `.metric` values.
// Constructor function of the Under stream responsible for emitting
// events over a fixed value.
//
var Under = module.exports = function (floor) {
  if (!floor) {
    throw new Error('floor is required.');
  }

  ReadWriteStream.call(this);
  this.floor = floor;
};

//
// Inherit from ReadWriteStream
//
util.inherits(Under, ReadWriteStream);

//
// ### function write (data)
// #### @data {Object} JSON to filter
// Emits data only if `.metric` is under `this.floor`.
//
Under.prototype.write = function (data) {
  if (data.metric < this.floor) {
    this.emit('data', data);
  }
};