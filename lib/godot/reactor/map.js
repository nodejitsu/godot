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
// Constructor function of the Map stream responsible for mapping
// events before emitting them.
//
var Map = module.exports = function (mapFn) {
  if (!mapFn || typeof mapFn !== 'function') {
    throw new Error('map function is required.');
  }

  ReadWriteStream.call(this);
  this.mapFn = mapFn;
  this.async = mapFn.length === 2;
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

  this.mapFn(data, function (err, data) {
    return err
      ? self.emit('error', err)
      : self.emit('data', data);
  });
};
