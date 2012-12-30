/*
 * read-write-stream.js: Simple readable and writable stream.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var stream = require('stream'),
    utile = require('utile');

var ReadWriteStream = module.exports = function ReadWriteStream() {
  this.readable = true;
  this.writable = true;
  
  stream.Stream.call(this);
};

utile.inherits(ReadWriteStream, stream.Stream);