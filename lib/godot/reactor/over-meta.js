/*
 * over-meta.js :: Stream responsible for emitting events over a fixed value for a specific meta key
 *
 * (C) 2013, Nodejitsu Inc.
 *
 */

var util = require('util'),
    ReadWriteStream = require('../common/read-write-stream');

//
// ### function OverMeta (key, ceiling)
// #### @key {String} Any key that would possibly be found in the meta property
// #### @ceiling {Number} Value to compare the `.meta[this.key]` value to
// Constructor function of the OverMeta stream that emits events over
// a fixed value for a specific meta key
//
var OverMeta = module.exports = function (key, ceiling) {
  if (!(this instanceof OverMeta)) { return new OverMeta(key, ceiling) }
  if(!key || !ceiling) {
    throw new Error('both meta key and ceiling value required');
  }

  ReadWriteStream.call(this);

  this.key = key;
  this.ceiling = ceiling;

};

//
// Inherit from ReadWriteStream
//
util.inherits(OverMeta, ReadWriteStream);

//
// ### function write (data)
// #### @data {Object} JSON to assess
// Emits data only if `.meta[this.key]` is over `this.ceiling`
//
OverMeta.prototype.write = function (data) {
  var val = data.meta && data.meta[this.key];

  if (!val || val <= this.ceiling) { return }

  this.emit('data', data);
};
