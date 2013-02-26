/*
 * net.js: Mocks for godot client and server.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var dgram = require('dgram'),
    net = require('net'),
    JsonParser = require('../../lib/godot/common').JsonParser;

//
// ### function createServer (options, callback)
// Creates a mock client with the specified `options`.
//
exports.createClient = function (options, callback) {
  options.type = options.type || 'tcp';

  var client;

  if (options.type === 'tcp') {
    client = new net.Socket({ type: 'tcp4' });
    client.setEncoding('utf8');
    client.connect(options.port, options.host, function () {
      callback(null, client);
    });
  }
  else if (options.type === 'udp') {
    client = dgram.createSocket('udp4');
    callback(null, client);
  }
};

//
// ### function createServer (options, callback)
// Creates a mock server with the specified `options`.
//
exports.createServer = function (options, callback) {
  options.type = options.type || 'tcp';

  var responded,
      server,
      parser;

  //
  // Helper function to respond to the callback
  //
  function respond(err) {
    if (!responded) {
      server.removeAllListeners('error');
      server.removeAllListeners('listening');
      responded = true;

      return err
        ? callback(err)
        : callback(null, server);
    }
  }

  if (options.type === 'udp') {
    server = dgram.createSocket('udp4');
    parser = new JsonParser();
    parser.on('data', function (data) {
      server.emit('data', data);
    })

    server.on('message', function (data) {
      console.log('' + data)
      parser.write('' + data);
    });

    server.once('listening', respond);
    server.once('error', respond);
    server.bind(options.port, options.host);
  }
  else if (options.type === 'tcp') {
    server = net.createServer();
    server.on('connection', function (socket) {
      socket.setEncoding('utf8');

      var parser = new JsonParser();
      socket.pipe(parser);

      parser.on('data', function (data) {
        server.emit('data', data);
      });
    });

    server.once('error', respond);
    server.listen(options.port, options.host, respond);
  }
  else if (options.type === 'unix') {
    server = net.createServer({type: 'unix'});
    server.on('connection', function (socket) {
      socket.setEncoding('utf8');

      var parser = new JsonParser();
      socket.pipe(parser);

      parser.on('data', function (data) {
        server.emit('data', data);
      });
    });

    server.once('error', respond);
    server.listen(options.path, respond);
  }
};
