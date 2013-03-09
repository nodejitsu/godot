/*
 * by-test.js: Tests for the By reactor stream.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    godot = require('../../lib/godot'),
    macros = require('../macros').reactor;

var counts = {
  service: 0,
  'service+ttl': 0
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
    )
  }
}).addBatch({
  "Should emit pipe the events to the correct pipe-chains": function () {
    assert.equal(counts.service, 6);
    assert.equal(counts['service+ttl'], 12);
  }
}).export(module);