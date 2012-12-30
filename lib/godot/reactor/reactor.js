/*
 * reactor.js: Reactor object responsible for creating pipe chains of streams for reacting to events.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    uuid = require('node-uuid'),
    ReadWriteStream = require('../common/read-write-stream');

//
// ### function Reactor ()
// Constructor function for the Reactor object responsible for creating
// pipe chains of streams for reacting to events.
//
var Reactor = module.exports = function Reactor() {
  this.reactors = [];
  this.id = uuid.v4();
};

//
// ### function createStream ()
// Instantiates a new and unique pipe-chain for the reactors
// associated with this instance.
//
Reactor.prototype.createStream = function (source) {
  source = source || new ReadWriteStream();
  
  //
  // Helper function which wraps the `Stream` constructor
  // function and applys the arguments passed to the target
  // `reactor.Reactor.prototype[method]` liberally. This
  // allows for variable arguments when constructing
  // reactor chains. e.g.:
  //
  //    reactor()
  //      .where('service', '*/health/heartbeat')
  // OR
  //
  //    reactor()
  //      .where({
  //        'state': 'critical',
  //        'service': '*/health/heartbeat'
  //      })
  //
  function wrapStream(Stream, args) {
    var wrap = {};
    Stream.apply(wrap, args);
    wrap.__proto__ = Stream.prototype;
    return wrap;
  }
  
  return this.reactors.reduce(function (last, nextOptions) {
    var next = wrapStream(nextOptions.Factory, nextOptions.args || []);
    last.pipe(next);
    return next;
  }, source);
};