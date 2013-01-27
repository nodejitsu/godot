/*
 * where-test.js: Tests for the Where reactor stream.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    godot = require('../../lib/godot'),
    macros = require('../macros').reactor;

vows.describe('godot/reactor/where').addBatch({
  "Godot where": {
    "service, */health/heartbeat": macros.shouldEmitDataSync(
      godot
        .reactor()
        .where('service', '*/health/heartbeat'),
      'health',
      2
    ),
    "service, /.*/heartbeat$/": macros.shouldEmitDataSync(
      godot
        .reactor()
        .where('service', /.*\/heartbeat$/),
      'health',
      2
    ),
    "{ service: '*/health/heartbeat' }": macros.shouldEmitDataSync(
      godot
        .reactor()
        .where({ service: '*/health/heartbeat' }),
      'health',
      2
    )
  }
}).export(module);