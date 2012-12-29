/*
 * reactor.js: Producer object responsible for processing events and reacting.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var stream = require('stream'),
    utile = require('utile');

var Reactor = module.exports = function Reactor() {
  stream.Stream.call(this);

  this.readable = true;
  this.writable = true;
  this.last     = this;  
};

utile.inherits(Reactor, stream.Stream);