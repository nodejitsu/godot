/*
 * over-test.js: Tests for the Over reactor stream.
 *
 * (C) 2012, Charlie Robbins, Jarrett Cruger, and the Contributors.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    godot = require('../../lib/godot'),
    macros = require('../macros').reactor;

vows.describe('godot/reactor/over').addBatch({
  "Godot over": {
    "5": macros.shouldEmitDataSync(
      godot
        .reactor()
        .over(5),
      'over-under',
      5
    )
  }
}).export(module);