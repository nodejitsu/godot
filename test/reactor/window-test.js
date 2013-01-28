/*
 * over-test.js: Tests for the Over reactor stream.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    godot = require('../../lib/godot'),
    macros = require('../macros').reactor;

vows.describe('godot/reactor/window').addBatch({
  "Godot eventWindow": {
    "{ fixed: true, size: 3 }": macros.shouldHaveMetricSync(
      godot
        .reactor()
        .eventWindow({
          fixed: true,
          size: 3
        })
        .combine(godot.math.sum),
      'pings',
      3
    ),
    "{ fixed: false, size: 1 }": macros.shouldEmitDataSync(
      godot
        .reactor()
        .eventWindow({
          fixed: false,
          size: 1
        }),
      'pings',
      3,
      function (all) {
        all.forEach(function (set) {
          assert.lengthOf(set, 1);
        });
      }
    )
  }
}).export(module);