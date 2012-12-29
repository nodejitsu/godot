/*
 * producer.js: Producer object responsible for creating events to process.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var stream = require('stream'),
    utile = require('utile');

var Producer = module.exports = function Producer() {
  this.readable = true;
  
  stream.Stream.call(this);
};

utile.inherits(Producer, stream.Stream);