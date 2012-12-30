/*
 * reactor.js: Top-level include for the `reactors` module responsible processing and reacting to events.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

//
// ### function reactor (options)
// #### @options {Object} Options to use when instantiating this reactor
// Creates a new prototypal Reactor for later instantiation.
//
var reactor = module.exports = function (options) {
  return new reactor.Reactor(options);
};

//
// ### @Reactor {Object}
// Base Prototype for the Reactor.
//
reactor.Reactor = require('./reactor');

//
// ### function register (method, Stream)
// #### @method {String} Method to expose for the `Stream` prototype
// #### @Stream {Object} Stream prototype to pipe to in the `method`.
// Registers the `Stream` prototype as a method on the base `Reactor`
// prototype.
//
reactor.register = function (method, Stream) {
  if (reactor.Reactor.prototype[method]) {
    throw new Error('Cannot redefine reactor method: ' + method);
  }

  //
  // Define the specified `method`.
  //
  reactor.Reactor.prototype[method] = function () {
    this.reactors.push({
      Factory: Stream,
      args: Array.prototype.slice.call(arguments, 0)
    });

    return this;
  };
};

//
// Register the appropriate reactors
//
['aggregate', 'change', 'expire', 'where'].forEach(function (name) {
  reactor.register(name, require('./' + name));
});