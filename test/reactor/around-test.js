/*
 * around-test.js: Tests for the Around reactor stream.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    godot = require('../../lib/godot'),
    macros = require('../macros').reactor;

var counts = [0, 0, 0],
    over   = 0,
    under  = 0;

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

vows.describe('godot/reactor/around').addBatch({
  "Godot around": {
    "one reactor": macros.shouldEmitDataSync(
      godot.reactor()
        .around(
          godot.reactor().map(increment(0))
        ),
      'by',
      6
    ),
    "two reactors": macros.shouldEmitDataSync(
      godot.reactor()
        .around(
          godot.reactor().map(increment(1)),
          godot.reactor().map(increment(1))
        ),
      'by',
      6
    ),
    "three reactors": macros.shouldEmitDataSync(
      godot.reactor()
        .around(
          godot.reactor().map(increment(2)),
          godot.reactor().map(increment(2)),
          godot.reactor().map(increment(2))
        ),
      'by',
      6
    ),
    "over under": macros.shouldEmitDataSync(
      godot.reactor()
        .around(
          godot.reactor()
            .over(5)
            .map(function (data) {
              over++;
              return data;
            }),
          godot.reactor()
            .under(5)
            .map(function (data) {
              under++;
              return data;
            })
        ),
      'by',
      6
    )
  }
}).addBatch({
  "should emit pipe the events to the correct pipe-chains": function () {
    counts.forEach(function (length, i) {
      assert.equal(length, 6 * (i + 1));
    });

    assert.equal(over, 2);
    assert.equal(under, 4);
  }
}).export(module);