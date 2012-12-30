/*
 * client.js: Client object responsible for managing Producers attached to a TCP or UDP client.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var dgram = require('dgram'),
    net = require('net');

//
// ### function Server (options)
// #### @options {Object} Options for this server
// ####   @options.type      {udp|tcp} Networking protocol of this server.
// ####   @options.producers {Array}   Set of producers to get data from.
// ####   @options.host      {string}  Host to send producer data to.
// ####   @options.port      {Number}  Port to send producer data to.
// Constructor function for the Client object responsible for managing
// Producers attached to a TCP or UDP client.
//
var Client = module.exports = function Client(options) {
  if (!options || !options.type
      || !~['tcp', 'udp'].indexOf(options.type)) {
    throw new Error('Cannot create client without type: udp, tcp');
  }

  var self = this;

  this.type      = options.type;
  this.host      = options.host;
  this.port      = options.port;
  this.producers = {};
  this.handlers  = {};

  if (Array.isArray(options.producers)) {
    options.producers.forEach(function (producer) {
      self.add(producer);
    });
  }
};

//
// ### function add (producer)
// #### @producer {Producer} Producer to add to this server
// Adds the specified `producer` to this client. All data
// from the producer will be sent over the underlying
// network connection.
//
Client.prototype.add = function (producer) {
  var self = this;

  this.producers[producer.id] = producer;

  producer.on('data', this.handlers[producer.id] = function (data) {
    //
    // Ignore data until we have a socket
    //
    if (self.socket) {
      self.write(data);
    }
  });
};

//
// ### function remove (reactor)
// #### @producer {producer} Producer to remove from this client.
// Removes the specified `producer` from this client. All data
// from the producer will no longer be sent over the underlying
// network connection.
//
Client.prototype.remove = function (producer) {
  producer.removeListener('data', this.handlers[producer.id]);
  delete this.producers[producer.id];
  delete this.handlers[producer.id];
};

//
// ### function write (data)
// #### @data {Object} Data to write.
// Writes the specified `data` to the underlying network
// connection associated with this client.
//
Client.prototype.write = function (data) {
  var message = JSON.stringify(data) + '\n';

  if (this.type === 'tcp') {
    this.socket.write(message)
  }
  else if (this.type === 'udp') {
    message = new Buffer(message);
    this.socket.send(message, 0, message.length, this.port, this.host);
  }
};

//
// ### function connect (callback)
// #### @port {Number} **Optional** Port number to connect on.
// #### @host {String} **Optional** Host to connect to.
// #### @callback {function} **Optional** Continuation to respond to.
// Opens the underlying network connection for this client.
//
Client.prototype.connect = function (port, host, callback) {
  var err;

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

  this.port = port || this.port;
  this.host = host || this.host || '0.0.0.0';

  if (!this.host || !this.port) {
    err = new Error('host and port are required to connect');
    if (callback) {
      return callback(err);
    }

    throw err;
  }

  if (this.type === 'tcp') {
    this.socket = new net.Socket({ type: 'tcp4' });
    this.socket.setEncoding('utf8');
    this.socket.connect(this.port, this.host, callback);
  }
  else if (this.type === 'udp') {
    this.socket = dgram.createSocket('udp4');
    if (callback) {
      callback();
    }
  }
};

//
// ### function close (callback)
// #### @callback {function} **Optional** Continuation to respond to.
// Closes the underlying network connection for this client.
//
Client.prototype.close = function (callback) {
  if (this.type === 'tcp') {
    this.socket.close(callback);
  }
  else if (this.type === 'udp') {
    this.socket.close();
    if (callback) {
      callback();
    }
  }
};