/*
 * by.js: Stream for creating a new set of streams based on a key change
 *
 * (C) 2013, Nodejitsu Inc.
 *
 */

var util = require('util'),
    FilterStream = require('../common/filter-stream'),
    ReadWriteStream = require('../common/read-write-stream');

//
// ### function By (keys, reactor)
// #### @key {string|Array} Particular key to listen for a change
// #### @reactor {godot.reactor().type()} Reactor or reactor chain to be created
// #### @options {Object} options object
// ####   @recombine {Boolean} Recombines the data from the split streams
// Constructor function for the by stream to trigger the creation of a new set
// of streams based on a key change.
//
var By = module.exports = function (keys, reactor, options) {
  if (!(this instanceof By)) { return new By(keys, reactor, options )}
  ReadWriteStream.call(this);

  if ((typeof keys !== 'string' && !Array.isArray(keys))
     || typeof reactor !== 'function') {
    throw new Error('This reactor takes key(s) and a reactor factory function as an argument');
  }

  this.keys      = !Array.isArray(keys) ? [keys] : keys;
  this.options   = options || {};
  this.reactor   = reactor;
  this.recombine = this.options.recombine || false;
  this.sources   = this.keys.reduce(function (all, key) {
    all[key] = {};
    return all;
  }, {});
  this.streams   = this.keys.reduce(function (all, key) {
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

  //
  // TODO: Internal error handling here with this internal pipe chain
  //
  this.keys.forEach(function (key) {
    var value = data[key];

    if (!self.streams[key][value]) {
      self.sources[key][value] = new FilterStream(key, value);
      self.streams[key][value] = self.reactor(self.sources[key][value]);
      if (self.recombine) {
        self.streams[key][value].on('data', self.emit.bind(self, 'data'));
      }
    }
    self.sources[key][value].write(data);
  });

  if (!this.recombine) {
    this.emit('data', data);
  }
};
