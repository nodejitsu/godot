/*
 * read-write-stream.js: Simple readable and writable stream.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var stream = require('stream'),
    utile = require('utile');

//
// ### function ReadWriteStream ()
// A simple Readble and Writable base stream.
//
var ReadWriteStream = module.exports = function ReadWriteStream() {
  this.readable = true;
  this.writable = true;

  stream.Stream.call(this);

  //
  // Set max listeners to zero since we are piping shit like crazy
  //
  this.setMaxListeners(0);
};

//
// Inherit from `stream.Stream`.
//
utile.inherits(ReadWriteStream, stream.Stream);

//
// ### function write (data)
// Emits the "data" event with the pass-thru `data`.
//
ReadWriteStream.prototype.write = function (data) {
  this.emit('data', data);
};

//
// ### function end (data)
// Emits the "end" event.
//
ReadWriteStream.prototype.end = function () {
  this.emit('end');
};
