/*
 * mean-test.js: Tests for the Mean reactor stream.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    godot = require('../../lib/godot'),
    macros = require('../macros').reactor;

vows.describe('godot/reactor/mean').addBatch({
  "Godot mean": {
    "ping": macros.shouldHaveMetric(
      godot
        .reactor()
        .mean(),
      'pings',
      1
    )
  }
}).export(module);