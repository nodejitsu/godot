/*
 * client.js: Client object responsible for managing Producers attached to a TCP or UDP client.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var Client = module.exports = function Client(options) {
  if (!options || !options.type) {
    throw new Error('Cannot create server without type: udp, tcp');
  }
  
  this.producers = {};
  this.handlers = {};
};

Client.prototype.add = function (producer) {
  var self = this;
  
  this.producers[producer.name] = producer;
  
  producer.on('data', this.handlers[producer.name] = function (data) {
    self.client.send(data);
  });
};

Client.prototype.remove = function (producer) {
  producer.removeListener('data', this.handlers[producer.name]);
  delete this.producers[producer.name];
  delete this.handlers[producer.name];
};

Client.prototype.open = function () {
  
};

Client.prototype.close = function () {
  
};