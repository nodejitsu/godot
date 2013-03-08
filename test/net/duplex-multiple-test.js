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

vows.describe('godot/net/duplex/multiple').addBatch({
  "Godot duplex": {
    "tagged": macros.shouldDuplexAll(
      {
        ttl: 200,
        reactors: [
          godot.reactor('tagged')
            .taggedAll('a', 'b')
        ],
        producers: [
          godot.producer(helpers.fixtures['producer-test']),
          godot.producer(helpers.fixtures['producer-tagged'])
        ]
      },
      {
        "should only receive `a` and `b` tagged events": {
          topic: function () {
            var until = 15,
                that = this,
                taggedStream;

            that.data = [];

            taggedStream = helpers.net.getStream(this.server, 'tagged')

            taggedStream.on('data', function onData(data) {
              that.data.push(data);
              if (that.data.length > until) {
                that.callback(null, data);
                taggedStream.removeListener('data', onData);
              }
            });
          },
          "should emit events appropriately": function (_, data) {
            var fixture = helpers.fixtures['producer-tagged'];

            assert.isNumber(data.time);
            Object.keys(fixture).forEach(function (key) {
              assert.deepEqual(fixture[key], data[key]);
            });
          }
        }
      }
    )
  }
}).export(module);
