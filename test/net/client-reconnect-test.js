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
    macros = require('../macros');

vows.describe('godot/net/client').addBatch({
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
            type: 'exponential',
            maxTries: 2,
            initialDelay: 100,
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
        assert(t >= 300);
      }
    }
  }
}).export(module);
