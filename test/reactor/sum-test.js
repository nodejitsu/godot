/*
 * sum-test.js: Tests for the Sum reactor stream.
 *
 * (C) 2012, Charlie Robbins, Jarrett Cruger, and the Contributors.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    godot = require('../../lib/godot'),
    macros = require('../macros').reactor;

vows.describe('godot/reactor/sum').addBatch({
  "Godot sum": {
    "ping": macros.shouldHaveMetricSync(
      godot
        .reactor()
        .sum(),
      'pings',
      3
    )
  }
}).export(module);