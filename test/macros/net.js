/*
 * net.js: Test macros for godot network communication.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    async = require('utile').async,
    helpers = require('../helpers'),
    mocks = require('../mocks'),
    fs = require('fs'),
    godot = require('../../lib/godot');

//
// ### function shouldStartServer(options, nested)
// #### @options {Options} Options to setup communication
// ####   @options.type      {udp|tcp} Network protocol.
// ####   @options.port      {number}  Port to communicate over.
// #### @nested {Object} Vows context to use once server is started.
// Starts the server with specified options.
//
exports.shouldStartServer = function (options, nested) {
  var context = {
    topic: function () {
      var self = this;

      function create() {
        mocks.net.createServer(options, function (err, server) {
          if (err) {
            console.log('Error creating mock server');
            console.dir(err);
            process.exit(1);
          }

          self.server = server;

          self.callback(null, server);
        });
      }

      options.type === 'unix'
        ? fs.unlink('unix.sock', create)
        : create();
    }
  };

  if (nested) {
    context['after the server is created'] = nested;
  }

  return context;
};

//
// ### function shouldSendData (options, nested)
// #### @options {Options} Options to setup communication
// ####   @options.type      {udp|tcp} Network protocol.
// ####   @options.port      {number}  Port to communicate over.
// ####   @options.producers {Array}   Set of producers to use.
// #### @nested {Object} Vows context to use once communcation is established.
// Starts a client test run sending data:
//   * Establishes full-duplex communication over the specified
//     `options.type` network protocol on `options.port`, creating
//     the necessary mock Server and `godot.net.Client`.
//   * Runs the specified `nested` test context.
//
exports.shouldSendData = function (options, nested) {
  if (nested && nested.topic) {
    throw new Error('Cannot have topic in top-level of nested context');
  }

  var context = {
    topic: function (server) {
      var self = this;

      helpers.net.createClient(options, function (err, client) {
        self.client = client;

        server.once('data', function (data) {
          self.callback(null, data);
        });
      });
    },
    "should send data to the server": function (err, data) {
      assert.isNull(err);
      assert.isObject(data);

      var fixture = helpers.fixtures['producer-test'];
      Object.keys(fixture).forEach(function (key) {
        assert.deepEqual(fixture[key], data[key]);
      })
    }
  };


  if (nested) {
    Object.keys(nested).forEach(function (vow) {
      if (!context.hasOwnProperty('after data is sent')) {
        context['after data is sent'] = {};
      }
      context['after data is sent'][vow] = nested[vow];
    });
  }

  return exports.shouldStartServer(options, context);
};

//
// ### function shouldSendDataOverAll (options, nested)
// #### @options {Options} Options to setup communication
// ####   @options.producers {Array}   Set of producers to use.
// #### @nested {Object} Vows context to use once communcation is established.
// Does the same as `exports.shouldSendData`, but runs the test over
// TCP UNIX **and** UDP.
//
exports.shouldSendDataOverAll = function (options, nested) {
  return {
    "TCP": exports.shouldSendData({
      type: 'tcp',
      port: helpers.nextPort,
      host: 'localhost',
      producers: options.producers
    }, nested),
    "UDP": exports.shouldSendData({
      type: 'udp',
      host: 'localhost',
      port: helpers.nextPort,
      producers: options.producers
    }, nested),
    "UNIX": exports.shouldSendData({
      type: 'unix',
      path: 'unix.sock',
      producers: options.producers
    }, nested)
  };
};

//
// ### function shouldDuplex (options, nested)
// #### @options {Options} Options to setup full duplex communication
// ####   @options.type      {udp|tcp} Network protocol.
// ####   @options.port      {number}  Port to communicate over.
// ####   @options.ttl       {number}  Default Expiry TTL.
// ####   @options.reactors  {Array}   Set of reactors to use.
// ####   @options.producers {Array}   Set of producers to use.
// #### @nested {Object} Vows context to use once communcation is established.
// Starts a full duplex test run:
//   * Establishes full-duplex communication over the specified
//     `options.type` network protocol on `options.port`, creating
//     the necessary `godot.net.Server` and `godot.net.Client`.
//   * Runs the specified `nested` test context.
//
exports.shouldDuplex = function (options, nested) {
  if (nested && nested.topic) {
    throw new Error('Cannot have topic in top-level of nested context');
  }

  var context = {
    topic: function () {
      var that = this;
      fs.unlink('unix.sock', function () {
        async.series({
          //
          // * Create the `godot.net.Server` instance
          //
          server: async.apply(
            helpers.net.createServer, options
          ),
          //
          // * Create the `godot.net.Client` instance
          //
          client: async.apply(
            helpers.net.createClient, options
          )
        }, function (err, results) {
          if (err) {
            return that.callback(err);
          }

          that.server = results.server;
          that.client = results.client;
          that.callback();
        });
      });
    },
    "should start correctly": function (err, _) {
      assert.isNull(err);
      assert.isTrue(!(_ instanceof Error));
      assert.isObject(this.server);
      assert.isObject(this.server.server);
      assert.isObject(this.client);
      assert.isObject(this.client.socket);
    },
    "after the default TTL": {
      topic: function () {
        setTimeout(this.callback.bind(this), options.ttl);
      },
      "server should have connections and reactors": function () {
        var server = this.server;
        assert.isObject(server.reactors);
        assert.isObject(server.hosts);
      },
      "client should have connection, producers, and handlers": function () {
        var client = this.client;
        assert.isObject(client.producers);
        assert.isObject(client.handlers);
      }
    }
  };

  if (nested) {
    Object.keys(nested).forEach(function (vow) {
      context['after the default TTL'][vow] = nested[vow];
    });
  }

  return context;
};

//
// ### function shouldDuplexAll (options, nested)
// #### @options {Options} Options to setup full duplex communication
// ####   @options.ttl       {number}  Default Expiry TTL.
// ####   @options.reactors  {Array}   Set of reactors to use.
// ####   @options.producers {Array}   Set of producers to use.
// #### @nested {Object} Vows context to use once communcation is established.
// Does the same as `exports.shouldDuplex`, but runs the test over
// TCP UNIX **and** UDP.
//
exports.shouldDuplexAll = function (options, nested) {
  return {
    "TCP": exports.shouldDuplex({
      type: 'tcp',
      ttl: options.ttl,
      port: helpers.nextPort,
      reactors: options.reactors,
      producers: options.producers
    }, nested),
    "UDP": exports.shouldDuplex({
      type: 'udp',
      ttl: options.ttl,
      port: helpers.nextPort,
      reactors: options.reactors,
      producers: options.producers
    }, nested),
    "UNIX": exports.shouldDuplex({
      type: 'unix',
      path: 'unix.sock',
      ttl: options.ttl,
      reactors: options.reactors,
      producers: options.producers
    }, nested)
  };
};
