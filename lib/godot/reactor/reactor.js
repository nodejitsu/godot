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
// #### @options {string|Object} Options for this reactor
// Constructor function for the Reactor object responsible for creating
// pipe chains of streams for reacting to events.
//
var Reactor = module.exports = function Reactor(options) {
  options = options || {};

  if (typeof options === 'string') {
    options = { name: options };
  }

  this.reactors = [];
  this.id = uuid.v4();
  this.name = options.name;
};

//
// ### function createStream ()
// Instantiates a new and unique pipe-chain for the reactors
// associated with this instance.
//
Reactor.prototype.createStream = function (source) {
  var self = this;

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
    wrap.__proto__ = Stream.prototype;
    Stream.apply(wrap, args);
    wrap.name = self.name;
    wrap.id = self.id;
    return wrap;
  }

  return this.reactors.reduce(function (last, nextOptions) {
    var next = wrapStream(nextOptions.Factory, nextOptions.args || []);
    last.pipe(next);
    return next;
  }, source);
};