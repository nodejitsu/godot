/*
 * under-test.js: Tests for the Under reactor stream.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    godot = require('../../lib/godot'),
    macros = require('../macros').reactor;

vows.describe('godot/reactor/under').addBatch({
  "Godot under": {
    "5": macros.shouldEmitDataSync(
      godot
        .reactor()
        .under(5),
      'over-under',
      5
    )
  }
}).export(module);