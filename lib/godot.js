/*
 * godot.js: Top-level include for the `godot` module.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

//
// ### @net {Object}
// Expose `net` module for creating `udp` and
// `tcp` servers.
//
exports.net = require('./godot/net');

//
// ### @reactor {Object}
// Expose `reactor` module for processing and
// reacting to events.
//
exports.reactor  = require('./godot/reactor');

//
// ### @producer {Object}
// Expose `producer` module for creating events
// to process and react to.
//
exports.producer = require('./godot/producer');

//
// ### @common {Object}
// Expose `common` module for performing basic
// streaming.
//
exports.common = require('./godot/common');

//
// ### @math {Object}
// Expose `math` module for performing basic
// math on sets of events.
//
exports.math = require('./godot/common/math');

//
// ### function createServer (options)
// #### @options {Object} Options for the server
// ####   @options.type     {udp|tcp} Networking protocol of the server
// ####   @options.reactors {Array}   List of reactor streams
// Creates a new `net.Server` of the specified `options.type`
// for a set of reactors.
//
exports.createServer = function (options) {
  options = options || {};
  options.type = options.type || 'udp';

  return new exports.net.Server(options);
};

//
// ### function createClient (options)
// #### @options {Object} Options for the client
// ####   @options.type      {udp|tcp} Networking protocol of the client
// ####   @options.producers {Array}   List of producer streams
// Creates a new `net.Client` of the specified `options.type`
// for a set of producers.
//
exports.createClient = function (options) {
  options = options || {};
  options.type = options.type || 'udp';

  return new exports.net.Client(options);
};