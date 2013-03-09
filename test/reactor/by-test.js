/*
 * change-test.js: Tests for the Change reactor stream.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    godot = require('../../lib/godot'),
    macros = require('../macros').reactor;

var count = 0;

vows.describe('godot/reactor/by').addBatch({
  "Godot by": {
    "service": macros.shouldEmitDataSync(
      godot.reactor()
        .by(
          'service',
          godot.reactor().map(function (data) {
            count++;
            return data;
          })
        ),
      'by',
      3
    )
  }
}).addBatch({
  "Should emit pipe the events to the correct pipe-chains": function () {
    assert.equal(count, 3);
  }
}).export(module);