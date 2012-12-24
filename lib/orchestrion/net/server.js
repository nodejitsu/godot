/*
 * server.js: Server object responsible for managing Producers attached to a TCP or UDP server.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var Server = module.exports = function Server(options) {
  if (!options || !options.type) {
    throw new Error('Cannot create server without type: udp, tcp');
  }
  
  this.reactors = {};
  this.names = [];
};

Server.prototype.add = function (reactor) {
  this.reactors[reactor.name] = reactor;
};

Server.prototype.remove = function (reactor) {
  delete this.reactors[reactor.name];
};

Server.prototype.listen = function () {
  var self = this;
  
  this.server.on('data', function (data) {
    self.names.forEach(function (name) {
      self.reactors[name].write(data);
    });
  });
};

Server.prototype.close = function () {
  this.server.removeAllListeners('data');
  this.server.close();
};