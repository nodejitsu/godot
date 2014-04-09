/*
 * server.js: Server object responsible for managing Producers attached to a TCP or UDP server.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var dgram = require('dgram'),
    events = require('events'),
    net = require('net'),
    utile = require('utile'),
    jsonStream = require('json-stream'),
    uuid = require('node-uuid'),
    Socket = require('./socket'),
    common = require('../common'),
    ReadWriteStream = common.ReadWriteStream;

//
// ### function Server (options)
// #### @options {Object} Options for this server
// ####   @options.type      {udp|tcp} Networking protocol of this server
// ####   @options.reactors  {Array}   Set of reactors to send data to
// ####   @options.port      {Number}  **Optional** Port number to listen on.
// ####   @options.host      {String}  **Optional** Host to listen on.
// ####   @options.multiplex {boolean} **Optional** Value indicating if we should create
//                                     a unique reactor pipe-chain per host.
// Constructor function for the Server object responsible for managing
// an underlying udp or tcp server and piping data to a set of reactors.
//
var Server = module.exports = function Server(options) {
  if (!options || !options.type
      || !~['tcp', 'udp', 'unix'].indexOf(options.type)) {
    throw new Error('Cannot create server without type: udp, tcp, unix');
  }

  events.EventEmitter.call(this);

  var self = this;

  this.reactors  = {};
  this.hosts     = {};
  this.type      = options.type;
  this.host      = options.host;
  this.port      = options.port;
  this.path      = options.path
  this.multiplex = typeof options.multiplex !== 'undefined'
    ? options.multiplex
    : true;

  this.rawReactors = options.reactors;

  if (Array.isArray(options.reactors)) {
    options.reactors.forEach(function (reactor) {
      self.add(reactor);
    });
  }

  if (!this.multiplex) {
    this.createReactors('default');
  }
};

//
// Inherit from events.EventEmitter
//
utile.inherits(Server, events.EventEmitter);

//
// ### function add (reactor)
// #### @reactor {reactor} Reactor to add to this server
// Adds the specified `reactor` to this server. All data
// from incoming `host:port` pairs will be written to a unique
// instance of this reactor.
//
Server.prototype.add = function (reactor) {
  this.emit('add', reactor);
  //
  // Ok so we have this function that is a `factory` for a reactor
  // or something like that
  //
  reactor.id = reactor.id || uuid.v4();
  this.reactors[reactor.id] = reactor;
  //
  // Add reactor to the running set
  // Remark: there will only be one host in case of multiplex = false;
  // Lets special case this so we aren't adding reactors unnecessarily
  // See createReactors function for why
  //
  var keys = Object.keys(this.hosts);
  if (keys.length) {
    if (!this.multiplex) {
      return this.hosts['default'].push(this.createReactor(reactor.id));
    }

    for(var i=0; i<keys.length; i++) {
      this.hosts[keys[i]].push(this.createReactor(reactor.id));
    }
  }
};

//
// ### function remove (reactor)
// #### @reactor {reactor} Reactor to remove from this server
// Removes the specified `reactor` to this server. All data
// from incoming `host:port` pairs will no longer be written
// to unique instances of this `reactor`.
//
Server.prototype.remove = function (reactor) {
  this.emit('remove', reactor);
  this.reactors[reactor.id].socket.removeAllListeners();
  delete this.reactors[reactor.id];

  //
  // TODO: Remove this reactor from the running set
  //
};

//
// ### function listen (port, [host], callback)
// #### @port {Number} **Optional** Port number to listen on.
// #### @host {String} **Optional** Host to listen on.
// #### @callback {function} **Optional** Continuation to respond to.
// Listens on the underlying networking protocol and pipes
// all data for each unique `host:port` pair to a set of
// instantiated reactors.
//
Server.prototype.listen = function (port, host, callback) {
  var responded = false,
      self = this,
      err;

  //
  // Do some fancy arguments parsing to support everything
  // being optional.
  //
  if (!callback && typeof host === 'function') {
    callback = host;
    host = null;
  }

  Array.prototype.slice.call(arguments).forEach(function (arg) {
    switch (typeof arg) {
      case 'number':   port = arg; break;
      case 'string':   host = arg; break;
      case 'function': callback = arg; break;
    }
  });

  function error (arg) {
    err = new Error(arg + ' is required to listen');
    if (callback) {
      return callback(err);
    }
    self.emit('error', err);
  }

  // Split cases due to unix using `this.path`
  if (this.type === 'tcp' || this.type === 'udp') {
    this.port = port || this.port;
    this.host = host || this.host || '0.0.0.0';

    if (!this.port) {
      error('port');
    }
  }
  else if (this.type === 'unix') {
    // Equals host due to it being the only string
    this.path = host;

    if (!this.path) {
      error('path');
    }
  }

  function respond(err) {
    if (!responded) {
      self.server.removeListener('error', respond);
      self.server.removeListener('listening', respond);
      responded = true;

      if (!err) {
        self.emit('listening');
      }

      if (callback) {
        return callback(err);
      }

      if (err) {
        self.emit('error', err);
      }
    }
  }

  if (this.type === 'udp') {
    this.server = dgram.createSocket('udp4', this._onUdpMessage.bind(this));
    this.server.once('listening', respond);
    this.server.once('error', respond);
    this.server.bind(this.port, this.host);
  }
  else if (this.type === 'tcp') {
    this.server = net.createServer(this._onTcpSocket.bind(this));
    this.server.once('error', respond);
    this.server.listen(this.port, this.host, respond);
  }
  else if (this.type === 'unix') {
    this.server = net.createServer(this._onUnixSocket.bind(this));
    this.server.once('error', respond);
    this.server.listen(this.path, respond);
  }
};

//
// ### function close (callback)
// #### @callback {function} Continuation to respond to.
// Closes the underlying networking protocol.
//
Server.prototype.close = function (callback) {
  return (this.type === 'tcp' || this.type === 'unix')
    ? this.server.close(callback)
    : this.server.close();
};

//
// ### function createReactor
// #### @id {UUID} Reactor id
// Returns a source and dest stream object that
// the socket ends up writing to
//
Server.prototype.createReactor = function (id) {
  var socket = new Socket();
  return {
    socket: socket,
    reactor: this.reactors[id](socket)
  }
};

//
// ### function createReactors (id)
// #### @id {string} `host:port` id for these reactors.
// Instantiates a unique set of reactors for the specified `id`.
//
Server.prototype.createReactors = function (id) {
  var self = this;

  if (!this.hosts[id]) {
    //
    // Remark: If we are not creating a new set of streams
    // for each new connection (multiplex = false), then for
    // each new connection, have it point to the default
    // Reactors that were instantiated.
    //
    if (!this.multiplex && this.hosts['default']) {
      this.hosts[id] = this.hosts['default'];
      return;
    }

    this.hosts[id] = Object.keys(this.reactors)
      .map(this.createReactor.bind(this));
  }
};

//
// ### @private function _onUdpMessage (msg, rinfo)
// #### @msg {String} UDP message.
// #### @rinfo {Object} Remote address info.
// Writes the `msg` to the set of instantiated reactors
// for the `host:port` pair represented by `rinfo.address`
// and `rinfo.port`.
//
Server.prototype._onUdpMessage = function (msg, rinfo) {
  var address = rinfo.address,
      port = rinfo.port,
      id = address + ':' + port,
      reactors;

  if (!this.hosts[id]) {
    this.createReactors(id);
  }

  //
  // Remark: Too much churn here to emit?
  //
  reactors = this.hosts[id];

  //
  // TODO: Streaming JSON parsing sounds like the right things to do here
  //
  msg = JSON.parse(('' + msg).replace('\n', ''));
  for(var i = 0; i < reactors.length; i++) {
    reactors[i].socket.write(msg);
  }
};

//
// ### @private function _onTcpSocket (socket)
// #### @socket {net.Socket} New incoming socket.
// Listens for `data` events on the `socket` and writes
// it to the set of instantiated reactors for the `host:port`
// pair represented by `socket.remoteAddress` and
// `socket.remotePort`.
//
Server.prototype._onTcpSocket = function (socket) {
  var address = socket.remoteAddress,
      port = socket.remotePort,
      id = address + ':' + port,
      parser = jsonStream(),
      self = this,
      reactors;

  if (!this.hosts[id]) {
    this.createReactors(id);
  }

  //
  // Remark: Too much churn here to emit?
  //
  reactors = this.hosts[id];
  socket.setEncoding('utf8');

  parser.on('data', function (event) {
    for(var i = 0; i < reactors.length; i++) {
      reactors[i].socket.write(event);
    }
  });

  socket.pipe(parser);
};

//
// ### @private function _onUnixSocket (socket)
// #### @socket {net.Socket} New incoming socket.
// Listens for `data` events on the `socket` and writes
// it to the set of instantiated reactors for the `path`
// it was instantiated with.
//
Server.prototype._onUnixSocket = function (socket) {
  var self = this,
      id = this.path,
      parser = jsonStream(),
      reactors;

  if (!this.hosts[id]) {
    this.createReactors(id);
  }

  reactors = this.hosts[id];
  socket.setEncoding('utf8');

  parser.on('data', function (event) {
    for(var i = 0; i < reactors.length; i++) {
      reactors[i].socket.write(event);
    }
  });

  socket.pipe(parser);
};
