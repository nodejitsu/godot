/*
 * where-test.js: Tests for the Where reactor stream.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    godot = require('../../lib/godot'),
    macros = require('../macros');

vows.describe('godot/reactor/where').addBatch({
  "Godot reactors": {
    "where": macros.shouldEmitData(
      godot
        .reactor()
        .where('service', '*/health/heartbeat'),
      'health',
      2
    )
  }
}).export(module);