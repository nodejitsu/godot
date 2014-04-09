/*
 * around.js: Stream for piping to multiple independent reactors and passing through values
 *
 * (C) 2013, Nodejitsu Inc.
 *
 */

var util = require('util'),
    ReadWriteStream = require('../common/read-write-stream');

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
    if (!(typeof reactor !== 'function' )) {
      throw new Error('This reactor takes a set of reactor factories');
    }
  });

  this.reactors = reactors;
  this.streams  = reactors.map(function (reactor) {
    var source = self.pipe(new ReadWriteStream());
    return reactor(source);
  });
};

//
// Inherit from ReadWriteStream
//
util.inherits(Around, ReadWriteStream);
