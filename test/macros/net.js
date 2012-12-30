/*
 * net.js: Test macros for godot network communication.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    async = require('utile').async,
    helpers = require('../helpers'),
    godot = require('../../lib/godot');

//
// ### function shouldDuplex (options, context)
// #### @options {Options} Options to setup full duplex communication
// ####   @options.type      {udp|tcp} Network protocol.
// ####   @options.port      {number}  Port to communicate over.
// ####   @options.reactors  {Array}   Set of reactors to use.
// ####   @options.producers {Array}   Set of producers to use.
// #### @context {Object} Vows context to use once communcation is established.
// Starts a full duplex test run:
//   * Establishes full-duplex communication over the specified
//     `options.type` network protocol on `options.port`, creating
//     the necessary `godot.net.Server` and `godot.net.Client`.
//   * Runs the specified test `context`.
//
exports.shouldDuplex = function (options, context) {
  context.topic = function () {
    var that = this;

    async.series({
      //
      // * Create the `godot.net.Server` instance
      //
      server: function (next) {
        var server = godot.createServer({
          type: options.type,
          reactors: options.reactors
        });

        server.listen(options.port, options.host || 'localhost', function (err) {
          return err ? next(err) : next(null, server);
        });
      },
      //
      // * Create the `godot.net.Client` instance
      //
      client: function (next) {
        var client = godot.createClient({
          type: options.type,
          producers: options.producers
        });

        client.connect(options.port, options.host || 'localhost', function (err) {
          return err ? next(err) : next(null, client);
        })
      }
    }, function (err, results) {
      if (err) {
        return that.callback(err);
      }

      that.server = results.server;
      that.client = results.client;
      that.callback();
    });
  };

  context['should start correctly'] = function (err, _) {
    assert.isNull(err);
    assert.isTrue(!(_ instanceof Error));
    assert.isObject(this.server);
    assert.isObject(this.server.server);
    assert.isObject(this.client);
    assert.isObject(this.client.socket);
  };

  return context;
};