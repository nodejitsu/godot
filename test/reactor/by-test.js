/*
 * by-test.js: Tests for the By reactor stream.
 *
 * (C) 2012, Charlie Robbins, Jarrett Cruger, and the Contributors.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    godot = require('../../lib/godot'),
    macros = require('../macros').reactor;

var counts = {
  service: 0,
  'service+ttl': 0,
  'service+recombine': 0
};

vows.describe('godot/reactor/by').addBatch({
  "Godot by": {
    "service": macros.shouldEmitDataSync(
      godot.reactor()
        .by(
          'service',
          godot.reactor().map(function (data) {
            counts.service++;
            return data;
          })
        ),
      'by',
      6
    ),
    "[service, ttl]": macros.shouldEmitDataSync(
      godot.reactor()
        .by(
          ['service', 'ttl'],
          godot.reactor().map(function (data) {
            counts['service+ttl']++;
            return data;
          })
        ),
      'by',
      6
    ),
    "service, recombine": macros.shouldEmitDataSync(
      godot.reactor()
        .by(
          'service',
          godot.reactor().map(function (data, callback) {
            counts['service+recombine']++;

            //
            // Calling `callback` twice will cause `data` event to be emitted
            // twice on the `Map` stream, thus resulting in doubling each
            // message.
            //
            callback(null, data);
            callback(null, data);
          }),
          { recombine: true }
        ),
      'by',
      12
    )
  }
}).addBatch({
  "Should emit and pipe the events to the correct pipe-chains": function () {
    assert.equal(counts.service, 6);
    assert.equal(counts['service+ttl'], 12);
    assert.equal(counts['service+recombine'], 6);
  }
}).export(module);
