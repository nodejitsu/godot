/*
 * rollup-test.js: Tests for the Rollup reactor stream.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    godot = require('../../lib/godot'),
    macros = require('../macros').reactor;

vows.describe('godot/reactor/rollup').addBatch({
  "Godot rollup": {
    "interval": macros.shouldEmitData(
      godot
        .reactor()
        .rollup(100),
      'health',
      1,
      100
    ),"interval, limit": macros.shouldEmitData(
      godot
        .reactor()
        .rollup(100, 2),
      'health',
      2,
      300
    ),
    "options": macros.shouldEmitData(
      godot
        .reactor()
        .rollup({
          interval: 100,
          limit: 2
        }),
      'health',
      2,
      300
    )
  }
}).export(module);