/*
 * tag.js: Stream for setting the value (and any tags) from a second reactor on any data received.
 *
 * (C) 2013, Nodejitsu Inc.
 *
 */

var util = require('util'),
    ReadWriteStream = require('../common/read-write-stream'),
    Reactor = require('./reactor');

//
// ### function Tag (tag, reactor)
// #### @tag {string} Tag to use for the value of `reactor`.
// #### @reactor {godot.reactor().type()} Reactor to be created
// Constructor function for the tag stream responsible for setting
// the value (and any tags) from a second reactor on any data received.
//
var Tag = module.exports = function (tag, reactor) {
  ReadWriteStream.call(this);

  var self = this;

  this.tag     = tag;
  this.stream  = new ReadWriteStream();
  this.reactor = reactor.createStream(this.stream);
  this.reactor.on('data', function (data) {
    data.tags = data.tags || [];
    data.tags.push(self.tag + ':' + data.metric)
    data.metric = data._metric;
    delete data._metric;
    self.emit('data', data);
  });
};

//
// Inherit from ReadWriteStream
//
util.inherits(Tag, ReadWriteStream);

//
// ### function write (data)
// Writes the `data` to the tag stream associated
// with this instance and sets `_metric` so it can
// be replaced later on.
//
Tag.prototype.write = function (data) {
  data._metric = data.metric;
  this.stream.write(data);
};