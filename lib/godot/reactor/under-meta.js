/*
 * under-meta.js :: Stream responsible for emitting events under a fixed value for a specific meta key
 *
 * (C) 2013, Charlie Robbins, Jarrett Cruger, and the Contributors.
 *
 */

var util = require('util'),
    ReadWriteStream = require('../common/read-write-stream');

//
// ### function UnderMeta (key, floor)
// #### @key {String} any key that would possibly be found in the meta property
// #### @floor {Number} Value to compare to `.meta[this.key]` value to
// Constructor function of the UnderMeta stream that emits events under a fixed
// value for a specific meta key
//
var UnderMeta = module.exports = function (key, floor) {
  if (!(this instanceof UnderMeta)) { return new UnderMeta(key, floor) }
  if(!key || !floor) {
    throw new Error('both meta key and floor value are required');
  }

  ReadWriteStream.call(this);

  this.key = key;
  this.floor = floor;

};

//
//Inherit from ReadWriteStream
//
util.inherits(UnderMeta, ReadWriteStream);

//
// ### function write (data)
// #### @data {Object} JSON to assess
// Emits data only if `.meta[this.key]` is under `this.floor`
//
UnderMeta.prototype.write = function (data) {
  var val = data.meta && data.meta[this.key];

  if(!val || val >= this.floor) { return }

  this.emit('data', data);
};
