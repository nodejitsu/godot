/*
 * meta.js: Stream for setting the value (and any meta) from a second reactor on any data received.
 *
 * (C) 2013, Charlie Robbins, Jarrett Cruger, and the Contributors.
 *
 */

var util = require('util'),
    ReadWriteStream = require('../common/read-write-stream');

//
// ### function Meta (tag, reactor)
// #### @key {string} Meta key to use for the value of `reactor`.
// #### @reactor {godot.reactor().type()} Reactor to be created
// Constructor function for the Meta stream responsible for setting
// the value (and any meta) from a second reactor on any data received.
//
var Meta = module.exports = function (key, reactor) {
  if (!(this instanceof Meta)) { return new Meta(key, reactor) }
  ReadWriteStream.call(this);

  var self = this;

  this.key     = key;
  this.stream  = new ReadWriteStream();
  this.reactor = reactor(this.stream);
  this.reactor.on('data', function (data) {
    data.meta      = data.meta || {};
    data.meta[key] = data.metric;
    data.metric    = data._metric;
    delete data._metric;
    self.emit('data', data);
  });
};

//
// Inherit from ReadWriteStream
//
util.inherits(Meta, ReadWriteStream);

//
// ### function write (data)
// Writes the `data` to the meta stream associated
// with this instance and sets `_metric` so it can
// be replaced later on.
//
Meta.prototype.write = function (data) {
  data._metric = data.metric;
  this.stream.write(data);
};
