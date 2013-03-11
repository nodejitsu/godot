/*
 * around.js: Stream for piping to multiple independent reactors and passing through values 
 *
 * (C) 2013, Nodejitsu Inc.
 *
 */

var util = require('util'),
    ReadWriteStream = require('../common/read-write-stream'),
    Reactor = require('./reactor');

//
// ### function Around (reactor0, reactor1, ...)
// #### @reactor0,...reactorN {godot.reactor().type()*} Reactors to be created
// Constructor function for the thru stream responsible for piping to
// multiple independent reactors.
//
var Around = module.exports = function () {
  ReadWriteStream.call(this);

  var reactors = Array.prototype.slice.call(arguments),
      self     = this;

  reactors.forEach(function (reactor) {
    if (!(reactor instanceof Reactor)) {
      throw new Error('This reactor a set of godot.reactor() arguments');
    }
  });

  this.reactors = reactors;
  this.streams  = reactors.map(function (reactor) {
    var source = self.pipe(new ReadWriteStream());
    return reactor.createStream(source);
  });
};

//
// Inherit from ReadWriteStream
//
util.inherits(Around, ReadWriteStream);