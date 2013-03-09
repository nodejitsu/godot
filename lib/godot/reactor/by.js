/*
 * by.js: Stream for creating a new set of streams based on a key change
 *
 * (C) 2013, Nodejitsu Inc.
 *
 */

var util = require('util'),
    FilterStream = require('../common/filter-stream'),
    ReadWriteStream = require('../common/read-write-stream'),
    Reactor = require('./reactor');

//
// ### function By (keys, reactor)
// #### @key {string|Array} Particular key to listen for a change
// #### @reactor {godot.reactor().type()} Reactor or reactor chain to be created
// Constructor function for the by stream to trigger the creation of a new set
// of streams based on a key change.
//
var By = module.exports = function (keys, reactor) {
  ReadWriteStream.call(this);

  if ((typeof keys !== 'string' && !Array.isArray(keys))
     || !(reactor instanceof Reactor)) {
    throw new Error('This reactor takes key(s) and godot.reactor() as an argument');
  }

  this.keys    = !Array.isArray(keys) ? [keys] : keys;
  this.reactor = reactor;
  this.streams = this.keys.reduce(function (all, key) {
    all[key] = {};
    return all;
  }, {});
};

//
// Inherit from ReadWriteStream
//
util.inherits(By, ReadWriteStream);

//
// ### function write (data)
// #### @data {Object} JSON to filter
// Creates a new pipe-chain for `this.reactor`
// for any unique values for all of `this.keys`
// and pipes `data` to them.
//
By.prototype.write = function (data) {
  var self = this;

  this.keys.forEach(function (key) {
    var value = data[key];

    if (!self.streams[key][value]) {
      var source = new FilterStream(key, value);
      self.streams[key][value] = self.reactor.createStream(source);
      self.pipe(source);
    }
  });

  this.emit('data', data);
};
