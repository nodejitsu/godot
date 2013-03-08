/*
 * duplex-test.js: Basic tests for duplex godot Client/Server communication.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    godot = require('../../lib/godot'),
    helpers = require('../helpers'),
    macros = require('../macros').net;

vows.describe('godot/net/duplex').addBatch({
  "Godot duplex": {
    "where & where + expire": macros.shouldDuplexAll(
      {
        ttl: 200,
        reactors: [
          godot.reactor('where-expire')
            .where('service', 'godot/test')
            .expire(200),
          godot.reactor('where')
            .where('service', 'godot/test')
        ],
        producers: [
          godot.producer(helpers.fixtures['producer-test'])
        ]
      },
      {
        "'where' reactor": {
          topic: function () {
            helpers.net.getStream(this.server, 'where')
              .once('data', this.callback.bind(this, null));
          },
          "should emit events appropriately": function (_, data) {
            var fixture = helpers.fixtures['producer-test'];

            assert.isNumber(data.time);
            Object.keys(fixture).forEach(function (key) {
              assert.deepEqual(fixture[key], data[key]);
            });
          }
        },
        "'where-expire' reactor": {
          topic: function () {
            var that = this;

            helpers.net.getStream(this.server, 'where-expire')
              .once('data', function (data) {
                that.callback(new Error('TTL expired incorrectly.'));
              });

            setTimeout(this.callback, 300);
          },
          "should never expire": function (err, _) {
            assert.isNull(err);
          }
        }
      }
    )
  }
}).export(module);
