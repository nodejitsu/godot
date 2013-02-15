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
      || !~['tcp', 'udp', 'unix'].indexOf(options.type)) {
    throw new Error('Cannot create client without type: udp, tcp, unix');
  }

  var self = this;

  this.type      = options.type;
  this.host      = options.host;
  this.port      = options.port;
  this.path      = options.path;
  this.producers = {};
  this.handlers  = {
    data: {},
    end:  {}
  };

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
  var self = this,
      id = producer.id;

  this.producers[producer.id] = producer;

  producer.on('end', this.handlers.end[producer.id] = function () {
    self.remove(producer, id);
  });

  producer.on('data', this.handlers.data[producer.id] = function (data) {
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
Client.prototype.remove = function (producer, id) {
  id = id || producer.id;

  producer.removeListener('data', this.handlers.data[id]);
  producer.removeListener('end',  this.handlers.end[id]);
  delete this.producers[id];
  delete this.handlers.data[id];
  delete this.handlers.end[id];
};

//
// ### function write (data)
// #### @data {Object} Data to write.
// Writes the specified `data` to the underlying network
// connection associated with this client.
//
Client.prototype.write = function (data) {
  var message = !Array.isArray(data)
    ? JSON.stringify(data) + 'g!\n!t'
    : data.map(function (d) {
      return JSON.stringify(d) + 'g!\n!t';
    });

  if (this.type === 'tcp' || this.type === 'unix') {
    this.socket.write(message);
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

  function error (arg) {
    err = new Error(arg + ' required to connect');
    if (callback) {
      return callback(err);
    }

    throw err;
  }

  // Split cases due to unix using `this.path`
  if (this.type === 'tcp' || this.type === 'udp') {
    this.port = port || this.port;
    this.host = host || this.host || '0.0.0.0';

    if (!this.host || !this.port) {
      error('host and port are');
    }
  }
  else if (this.type === 'unix') {
    this.path = host || this.path;

    if (!this.path) {
      error('path is');
    }
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
  else if (this.type === 'unix') {
    this.socket = new net.Socket({type: 'unix' });
    this.socket.setEncoding('utf8');
    this.socket.connect(this.path, callback);
  }
};

//
// ### function close ()
// Closes the underlying network connection for this client.
//
Client.prototype.close = function () {
  if (this.type === 'tcp' || this.type === 'unix') {
    this.socket.destroy();
  }
  else if (this.type === 'udp') {
    this.socket.close();
  }

  var self = this;

  Object.keys(this.producers).forEach(function (id) {
    self.remove(self.producers[id]);
  });
};
