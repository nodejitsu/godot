/*
 * client-reconnect-test.js: Basic tests for the reconnection of net client.
 *
 * (C) 2013, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    async = require('utile').async,
    godot = require('../../lib/godot'),
    helpers = require('../helpers'),
    macros = require('../macros'),
    mocks = require('../mocks');

vows.describe('godot/net/client-reconnect').addBatch({
  "Godot client": {
    "with no backoff and no server": {
      topic: function () {
        var callback = this.callback,
            port = helpers.nextPort;

        var client = godot.createClient({
          type: 'tcp',
          producers: [
            godot.producer(helpers.fixtures['producer-test'])
          ]
        });

        client.connect(port);
        client.on('error', function (err) {
          callback(null, err);
        });
      },
      "should emit an error": function (_, err) {
        assert(err);
        assert.instanceOf(err, Error);
      }
    },
    "with backoff and no server": {
      topic: function () {
        var callback = this.callback,
            port = helpers.nextPort,
            d = new Date();

        var client = godot.createClient({
          type: 'tcp',
          producers: [
            godot.producer(helpers.fixtures['producer-test'])
          ],
          reconnect: {
            retries: 2,
            minDelay: 100,
            maxDelay: 300
          }
        });

        client.connect(port);
        client.on('error', function (err) {
          callback(null, err, (new Date() - d));
        });
      },
      "should emit an error": function (_, err) {
        assert(err);
        assert.instanceOf(err, Error);
      },
      "should take appropiate amount of time": function (_, err, t) {
        assert(t >= 200);
      }
    },
    "with backoff and server eventually coming up": {
      topic: function () {
        var callback = this.callback,
            port = helpers.nextPort,
            d = new Date();

        var client = godot.createClient({
          type: 'tcp',
          producers: [
            godot.producer(helpers.fixtures['producer-test'])
          ],
          reconnect: {
            retries: 2,
            minDelay: 100,
            maxDelay: 300
          }
        });

        client.connect(port);
        client.on('error', function (err) {
          throw err;
        });

        setTimeout(function () {
          mocks.net.createServer({ type: 'tcp', port: port }, function (err, server) {
            if (err) {
              throw err;
            }

            server.once('data', function (data) {
              callback(null, data, (new Date()) - d);
            });
          });
        }, 300);
      },
      "should send data": function (err, data) {
        assert(!err);
        assert(data);
      },
      "should take appropiate amount of time": function (_, err, t) {
        assert(t >= 200);
      }
    }
  }
}).export(module);
