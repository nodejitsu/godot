/*
 * thru-test.js: Tests for the Thru reactor stream.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    godot = require('../../lib/godot'),
    macros = require('../macros').reactor;

var counts = [0, 0, 0];

//
// Helper function to increment the 
// appropriate count.
//
function increment(i) {
  return function (data) {
    counts[i]++;
    return data;
  };
}

vows.describe('godot/reactor/thru').addBatch({
  "Godot thru": {
    "one reactor": macros.shouldEmitDataSync(
      godot.reactor()
        .thru(
          godot.reactor().map(increment(0))
        ),
      'by',
      6
    ),
    "two reactors": macros.shouldEmitDataSync(
      godot.reactor()
        .thru(
          godot.reactor().map(increment(1)),
          godot.reactor().map(increment(1))
        ),
      'by',
      6
    ),
    "three reactors": macros.shouldEmitDataSync(
      godot.reactor()
        .thru(
          godot.reactor().map(increment(2)),
          godot.reactor().map(increment(2)),
          godot.reactor().map(increment(2))
        ),
      'by',
      6
    ),
  }
}).addBatch({
  "should emit pipe the events to the correct pipe-chains": function () {
    counts.forEach(function (length, i) {
      assert.equal(length, 6 * (i + 1));
    });
  }
}).export(module);