/*
 * map.js: Stream responsible for mapping events before emitting them.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var util = require('util'),
    ReadWriteStream = require('../common/read-write-stream');

//
// ### function Map (mapFn)
// #### @mapFn {function} Map function to call on each event.
// #### @options {Object} options to pass into reactor to customize behavior
// Constructor function of the Map stream responsible for mapping
// events before emitting them.
//
var Map = module.exports = function (mapFn, options) {
  if (!mapFn || typeof mapFn !== 'function') {
    throw new Error('map function is required.');
  }

  options = options || {};

  ReadWriteStream.call(this);
  this.mapFn = mapFn;
  this.async = mapFn.length === 2;
  //
  // So by default the behavior is to block the stream when running through
  // the async function. This option is here to allow you to do an async
  // operation that does not block the stream
  // TODO: Think of a better API for this behavior
  //
  this.passThrough = options.passThrough || false;
};

//
// Inherit from ReadWriteStream
//
util.inherits(Map, ReadWriteStream);

//
// ### function write (data)
// #### @data {Object} JSON to filter
// Emits data after it is mutating with `this.mapFn`.
//
Map.prototype.write = function (data) {
  var self = this;

  if (!this.async) {
    this.emit('data', this.mapFn(data));
    return;
  }

  if (!this.passThrough) {
    return this.mapFn(data, function (err, data) {
      return err
        ? self.emit('reactor:error', err)
        : self.emit('data', data);
    });
  }

  this.mapFn(data, function (err) {
    if (err) { self.emit('reactor:error', err) }
  });

  this.emit('data', data);
};
