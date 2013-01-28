/*
 * combine.js: Stream responsible for combining an event vector (like from a window).
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var util = require('util'),
    common = require('../common'),
    ReadWriteStream = common.ReadWriteStream;

//
// ### function Combine (combineFn)
// #### @combine {function} Combine function to call on each event vector.
// Constructor function of the Combine stream responsible for
// combining an event vector (like from a window).
//
var Combine = module.exports = function (combineFn) {
  if (!combineFn || typeof combineFn !== 'function') {
    throw new Error('combine function is required.');
  }

  ReadWriteStream.call(this);
  this.combineFn = combineFn;
};

//
// Inherit from ReadWriteStream
//
util.inherits(Combine, ReadWriteStream);

//
// ### function write (data)
// #### @data {Array} JSON event vector to combine
// Emits data after it is mutating with `this.mapFn`.
//
Combine.prototype.write = function (data) {
  var last = common.clone(data[data.length - 1]);
  
  //
  // Set time and other critical events
  //
  last.time   = +Date.now();
  last.metric = this.combineFn(data);
  
  this.emit('data', last);
};