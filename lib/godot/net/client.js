/*
 * client.js: Client object responsible for managing Producers attached to a TCP or UDP client.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var dgram = require('dgram'),
    net = require('net'),
    utile = require('utile'),
    ip = require('ip'),
    clone = utile.clone,
    back = require('back'),
    EventEmitter = require('events').EventEmitter,
    noop = function () {};

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

  if(typeof options.reconnect !== 'undefined'
     && typeof options.reconnect!== 'object') {
    throw new Error('Reconnect must be a defined object if used')
  }

  var self = this;

  this.type      = options.type;
  this.host      = options.host;
  this.port      = options.port;
  this.path      = options.path;
  this.reconnect = options.reconnect;
  this.attempt = null;
  this.producers = {};
  this.handlers  = {
    data: {},
    end:  {}
  };
  this.defaults = {
    host: ip.address(),
    state: 'ok',
    description: 'No Description',
    tags: [],
    metric: 1,
    ttl: 15000
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
utile.inherits(Client, EventEmitter);

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
    ? JSON.stringify(data) + '\n'
    : data.map(JSON.stringify).join('\n') + '\n'

  if (this.type === 'tcp' || this.type === 'unix') {
    this.socket.write(message);
  }
  else if (this.type === 'udp') {
    message = new Buffer(message);
    this.socket.send(message, 0, message.length, this.port, this.host);
  }
};

//
// ### function produce (data)
// #### @data {Object|Array} Data to write to socket with some extras
// Writes to a socket with some default values attached.
// This is purely a convenience method
//
Client.prototype.produce = function (data) {
  var self = this;

  //
  // Add defaults to each object where a value does not already exist
  //
  function defaultify (obj) {
    return Object.keys(self.defaults).reduce(function (acc, key) {
      if (!acc[key]) { acc[key] = self.defaults[key] }
      return acc;
    }, obj);
  }

  //
  // TODO: we may want to be monotonic here
  //
  this.defaults['time'] = Date.now();
  data = !Array.isArray(data)
    ? defaultify(data)
    : data.map(defaultify);

  return this.write(data);
};

//
// ### function connect (callback)
// #### @port {Number} **Optional** Port number to connect on.
// #### @host {String} **Optional** Host to connect to.
// #### @callback {function} **Optional** Continuation to respond to.
// Opens the underlying network connection for this client.
//
Client.prototype.connect = function (port, host, callback) {
  var self = this;

  //
  // Do some fancy arguments parsing to support everything
  // being optional.
  //
  if (!callback && typeof host === 'function') {
    callback = host;
    host = null;
  }

  if (!callback && typeof port === 'function') {
    callback = port;
    port = null
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

  function reconnect(err) {
    self.attempt = self.attempt || clone(self.reconnect);
    //
    // Remark: Terminate the backoff when we have hit our fail condition with
    // a noop to avoid an if statement
    //
    // TODO: Make this less coupled (I feel like i want this contained in
    // `back` but eh)
    //
    return self.terminate
      ? noop()
      : back(function (fail, backoff) {
        //
        // Remark: We are done here, emit error and set termination
        //
        if (fail) {
          self.terminate = true;
          self.attempt = null;
          return self.emit('error', err);
        }
        //
        // So we can listen on when reconnect events are about to fire
        //
        self.emit('reconnect', backoff);
        //
        // Attempt a CONNECT!
        //
        return connect();
      }, self.attempt);
  }

  function onError(err) {
    return self.reconnect
      ? reconnect(err)
      : self.emit('error', err);
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
      //
      // Remark: We have successfully connected so reset the terminate variable
      //
      self.terminate = false;
      self.emit('connect');
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
  var self = this;

  if (this.type === 'tcp' || this.type === 'unix') {
    this.socket.destroy();
  }
  else if (this.type === 'udp') {
    this.socket.close();
  }

  Object.keys(this.producers).forEach(function (id) {
    self.remove(self.producers[id]);
  });

  this.socket.on('close', function () {
    self.emit('close');
  });
};
