/*
 * server.js: Server object responsible for managing Producers attached to a TCP or UDP server.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var dgram = require('dgram'),
    net = require('net');

//
// ### function Server (options)
// #### @options {Object} Options for this server
// ####   @options.type     {udp|tcp} Networking protocol of this server
// ####   @options.reactors {Array}   Set of reactors to send data to
// Constructor function for the Server object responsible for managing
// an underlying udp or tcp server and piping data to a set of reactors.
//
var Server = module.exports = function Server(options) {
  if (!options || !options.type 
      || ~['tcp', 'udp'].indexOf(options.type)) {
    throw new Error('Cannot create server without type: udp, tcp');
  }
  
  var self = this;
  
  this.type     = options.type;
  this.reactors = {};
  this.hosts    = {};
  
  if (Array.isArray(options.reactors)) {
    options.reactors.forEach(function (reactor) {
      self.add(reactor);
    });
  }
};

//
// ### function add (reactor)
// #### @reactor {reactor} Reactor to add to this server
// Adds the specified `reactor` to this server. All data
// from incoming `host:port` pairs will be written to a unique
// instance of this reactor.
//
Server.prototype.add = function (reactor) {
  this.reactors[reactor.id] = reactor;
};

//
// ### function remove (reactor)
// #### @reactor {reactor} Reactor to remove from this server
// Removes the specified `reactor` to this server. All data
// from incoming `host:port` pairs will no longer be written
// to unique instances of this `reactor`.
//
Server.prototype.remove = function (reactor) {
  delete this.reactors[reactor.id];
  
  //
  // TODO: Remove this reactor from the running set
  //
};

//
// ### function listen (port, [host], callback)
// #### @port {Number} Port number to listen on.
// #### @host {String} **Optional** Host to listen on.
// #### @callback {function} Continuation to respond to.
// Listens on the underlying networking protocol and pipes
// all data for each unique `host:port` pair to a set of 
// instantiated reactors.
//
Server.prototype.listen = function (port, host, callback) {
  if (typeof host === 'function' && !callback) {
    callback = host;
    host = null;
  }
  
  var self = this;
  
  if (this.type === 'udp') {
    this.server = dgram.createSocket('udp4', this._onUdpMessage);
    this.server.once('listening', callback)
    this.server.bind(port, host);
  }
  else if (this.type === 'tcp') {
    this.server = net.createServer(this._onTcpSocket);
    this.server.listen(port, host, callback);
  }  
};

//
// ### function close (callback)
// #### @callback {function} Continuation to respond to.
// Closes the underlying networking protocol.
//
Server.prototype.close = function (callback) {
  return this.type === 'tcp'
    ? this.server.close(callback)
    : this.server.close();
};

//
// ### function createReactors (id)
// #### @id {string} `host:port` id for these reactors.
// Instantiates a unique set of reactors for the specified `id`.
//
Server.prototype.createReactors = function (id) {
  var self = this;
  
  if (!this.hosts[id]) {
    this.hosts[id] = Object.keys(this.reactors)
      .reduce(function (all, key) {
        all.push(self.reactors[key].createStream());
      }, []);
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
      reactor;

  if (!this.hosts[id]) {
    this.createReactors(id);
  }
  
  reactor = this.hosts[id];
  reactor.write(msg);
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
      reactor;
  
  if (!this.hosts[id]) {
    this.createReactors(id);
  }

  reactor = this.hosts[id];
  socket.on('data', function (data) {
    reactor.write(data);
  });
};