/*
 * reactor.js: Top-level include for the `reactors` module responsible processing and reacting to events.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var utile = require('utile');

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
['change',
 'console',
 'count',
 'combine',
 'email',
 'expire',
 'forward',
 'graphite',
 'map',
 'mean',
 'over',
 'rate',
 'rollup',
 'sms',
 'sum',
 'tagged',
 'throttle',
 'under',
 'where',
 'within'].forEach(function (name) {
   reactor.register(name, require('./' + name));
 });

//
// Register appropriate camelCase reactors
//
['event-window',
 'moving-average',
 'tagged-all',
 'tagged-any',
 'time-window'].forEach(function (name) {
  var parts = name.split('-');
  reactor.register(
    parts[0] + utile.capitalize(parts[1]),
    require('./' + name)
  );
});