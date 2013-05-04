/*
 * client.js: Client object responsible for managing Producers attached to a TCP or UDP client.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var dgram = require('dgram'),
    net = require('net'),
    util = require('util'),
    backoff = require('backoff'),
    EventEmitter = require('events').EventEmitter;

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
  EventEmitter.call(this);

  if (!options || !options.type
      || !~['tcp', 'udp', 'unix'].indexOf(options.type)) {
    throw new Error('Cannot create client without type: udp, tcp, unix');
  }

  var self = this;

  this.type      = options.type;
  this.host      = options.host;
  this.port      = options.port;
  this.path      = options.path;
  this.reconnect = options.reconnect;
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
// Inherit from EventEmitter
//
util.inherits(Client, EventEmitter);

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
    }).join();

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
  var self = this,
      connectBackoff, backoffType;

  if (this.reconnect) {
    if (typeof this.reconnect === 'object') {
      backoffType = this.reconnect.type || 'exponential';
      connectBackoff = backoff[backoffType](this.reconnect);
      connectBackoff.failAfter(this.reconnect.maxTries || 10);
    }
    else {
      connectBackoff = backoff.exponential();
      connectBackoff.failAfter(10);
    }

    connectBackoff.on('fail', function (err) {
      self.emit('error', err);
    });

    connectBackoff.on('ready', function () {
      connect();
    });
  }

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
    var err = new Error(arg + ' required to connect');
    return callback
      ? callback(err)
      : self.emit('error', err) ;
  }

  function onError(err) {
    return connectBackoff ? connectBackoff.backoff(err) : self.emit('error', err);
  }

  function connect() {
    if (self.type === 'tcp') {
      self.socket = net.connect({ port: self.port, host: self.host }, callback);
    }
    else if (self.type === 'udp') {
      self.socket = dgram.createSocket('udp4');
      if (callback) {
        process.nextTick(callback);
      }
    }
    else if (self.type === 'unix') {
      self.socket = net.connect({ path: self.path }, callback);
    }

    self.socket.on('error', onError);
    self.socket.on('connect', function () {
      if (connectBackoff) {
        connectBackoff.reset();
      }
      return self.emit('connect');
    });
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

  connect();
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

  return this.emit('close');
};
