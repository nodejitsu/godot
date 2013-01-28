/*
 * rate-test.js: Tests for the Rate reactor stream.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    godot = require('../../lib/godot'),
    macros = require('../macros').reactor;

vows.describe('godot/reactor/rate').addBatch({
  "Godot rate": macros.shouldEmitData(
    godot
      .reactor()
      .rate(50),
    'pings',
    1,
    60,
    function (all) {
      assert.equal(all[0].metric, 1)
    }
  )
}).export(module);