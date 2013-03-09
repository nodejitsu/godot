/*
 * filter-stream.js: Simple readable and writable stream that filters key by value.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    ReadWriteStream = require('./read-write-stream')

//
// ### function ReadWriteStream ()
// A aimple readable and writable stream that filters key by value.
//
var FilterStream = module.exports = function FilterStream(key, value) {
  this.key      = key;
  this.value    = value

  ReadWriteStream.call(this);
};

//
// Inherit from `ReadWriteStream`.
//
utile.inherits(FilterStream, ReadWriteStream);

//
// ### function write (data)
// Emits the "data" event with the pass-thru `data`.
//
FilterStream.prototype.write = function (data) {
  if (data[this.key] === this.value) {
    this.emit('data', data);
  }
};