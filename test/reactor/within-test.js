/*
 * within-test.js: Tests for the Within reactor stream.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    godot = require('../../lib/godot'),
    macros = require('../macros').reactor;

vows.describe('godot/reactor/within').addBatch({
  "Godot within": {
    "3, 6": macros.shouldEmitDataSync(
      godot
        .reactor()
        .within(3, 6),
      'over-under',
      3
    )
  }
}).export(module);