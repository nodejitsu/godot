/*
 * change-test.js: Tests for the Change reactor stream.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    godot = require('../../lib/godot'),
    macros = require('../macros').reactor;

vows.describe('godot/reactor/change').addBatch({
  "Godot change": {
    "service": macros.shouldEmitDataSync(
      godot
        .reactor()
        .change('service'),
      'health',
      2
    ),
    "service, from -> to": macros.shouldEmitDataSync(
      godot
        .reactor()
        .change('service', {from: 'charlie/app/health/memory', to: 'charlie/app/health/heartbeat'}),
      'from-to',
      1
    )
  }
}).export(module);
