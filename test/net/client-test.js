/*
 * client-test.js: Basic tests for the net Client module.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    async = require('utile').async,
    godot = require('../../lib/godot'),
    helpers = require('../helpers'),
    macros = require('../macros');

vows.describe('godot/net/client').addBatch({
  "Godot client": macros.net.shouldSendDataOverAll(
    {
      producers: [
        godot.producer(helpers.fixtures['producer-test'])
      ]
    },
    {
      "on close": {
        topic: function() {
          var client = this.client;
          client.close();
          this.callback();
        },
        "should remove all producers": function () {
          var client = this.client;
          assert.isObject(client.producers);
          assert.isEmpty(client.producers);
        }
      }
    }
  )
}).export(module);
