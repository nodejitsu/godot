/*
 * aggregate-test.js: Tests for the Aggregate reactor stream.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    godot = require('../../lib/godot'),
    macros = require('../macros');

vows.describe('godot/reactor/aggregate').addBatch({
  "Godot aggregate": {
    "ping": macros.shouldHaveMetric(
      godot
        .reactor()
        .aggregate(),
      'pings',
      3
    )
  }
}).export(module);