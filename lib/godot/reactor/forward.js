/*
 * forward.js: Stream for forwarding events to another remote server.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var util = require('util'),
    uuid = require('node-uuid'),
    Client = require('../net/client'),
    ReadWriteStream = require('../common/read-write-stream');

//
// ### function Forward (options)
// #### @options {Object} Options for forwarding events.
// ####   @options.type {tcp|udp} Networking protocol to use.
// ####   @options.host {string} Remote host to forward to.
// ####   @options.port {number} **Optional** Remote port to forward to.
// Constructor function of the Forward stream responsible for forwarding
// events to another remote server.
//
var Forward = module.exports = function (options) {
  if (!options || !options.type || !options.host || !options.port
      || !~['tcp', 'udp'].indexOf(options.type)) {
    throw new Error('options.type, options.host, and options.port are required');
  }

  ReadWriteStream.call(this);

  this.id   = uuid.v4();
  this.type = options.type;
  this.host = options.host;
  this.port = options.port;

  this.client = new Client({
    type: this.type,
    host: this.host,
    port: this.port,
    producers: [this]
  });

  this.client.connect();
};

//
// Inherit from ReadWriteStream
//
util.inherits(Forward, ReadWriteStream);

//
// Remark: No need for a `write` method here because this instance
// simply emits `data` events (by inheriting from ReadWriteStream)
// with are automatically sent to `this.client`.
//

//
// ### function end (data)
// Emits the "end" event and closes the underlying
// client connection.
//
Forward.prototype.end = function () {
  this.emit('end');

  if (this.client) {
    this.client.close();
  }
};