/*
 * reactor.js: Producer object responsible for processing events and reacting.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var stream = require('stream'),
    utile = require('utile');

var Reactor = module.exports = function Reactor() {
  this.readable = true;
  this.writable = true;
  
  stream.Stream.call(this);
};

utile.inherits(Reactor, stream.Stream);