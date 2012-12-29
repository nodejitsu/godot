/*
 * reactor.js: Top-level include for the `reactors` module responsible processing and reacting to events.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var reactor = module.exports = function (options) {
  return new reactor.Reactor(options);
};

reactor.Reactor = require('./reactor');

reactor.register = function (method, Stream) {
  if (reactor.Reactor.prototype[method]) {
    throw new Error('Cannot redefine reactor method: ' + method);
  }
  
  reactor.Reactor.prototype[method] = function (options) {
    var next = new Stream(options);
    this.last.pipe(next);
    this.last = next;
  };
};