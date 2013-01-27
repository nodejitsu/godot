/*
 * sms-test.js: Tests for the Sms reactor stream.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    godot = require('../../lib/godot'),
    macros = require('../macros').reactor,
    mocks = require('../mocks');

vows.describe('godot/reactor/sms').addBatch({
  "Godot sms": {
    "no interval": macros.shouldEmitDataSync(
      godot
        .reactor()
        .where('service', '*/health/memory')
        .sms({
          to: '800OKGODOT',
          from: '800GOGODOT',
          client: mocks.sms
        }),
      'health',
      1
    ),
    "interval": macros.shouldEmitDataSync(
      godot
        .reactor()
        .where('service', '*/health/heartbeat')
        .sms({
          to: '800OKGODOT',
          interval: 60 * 60 * 1000,
          from: '800GOGODOT',
          client: mocks.sms
        }),
      'health',
      1
    )
  }
}).export(module);