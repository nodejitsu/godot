/*
 * client.js: Client object responsible for managing Producers attached to a TCP or UDP client.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var Client = module.exports = function Client(options) {
  if (!options || !options.type
      || ~['tcp', 'udp'].indexOf(options.type)) {
    throw new Error('Cannot create server without type: udp, tcp');
  }
  
  var self = this;

  this.producers = {};
  this.handlers = {};
  
  if (Array.isArray(options.producers)) {
    options.producers.forEach(function (producer) {
      self.add(producer);
    });
  }
};

Client.prototype.add = function (producer) {
  var self = this;
  
  this.producers[producer.id] = producer;
  
  producer.on('data', this.handlers[producer.name] = function (data) {
    self.client.send(data);
  });
};

Client.prototype.remove = function (producer) {
  producer.removeListener('data', this.handlers[producer.id]);
  delete this.producers[producer.id];
  delete this.handlers[producer.id];
};

Client.prototype.open = function () {
  
};

Client.prototype.close = function () {
  
};