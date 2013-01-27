/*
 * email-test.js: Tests for the Email reactor stream.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    godot = require('../../lib/godot'),
    macros = require('../macros').reactor,
    mocks = require('../mocks');

vows.describe('godot/reactor/email').addBatch({
  "Godot email": {
    "no interval": macros.shouldEmitDataSync(
      godot
        .reactor()
        .where('service', '*/health/memory')
        .email({
          to: 'info@health.com',
          from: 'health@godot.com',
          subject: 'Memory report',
          client: mocks.email
        }),
      'health',
      1
    ),
    "interval": macros.shouldEmitDataSync(
      godot
        .reactor()
        .where('service', '*/health/heartbeat')
        .email({
          to: 'info@health.com',
          interval: 60 * 60 * 1000,
          from: 'health@godot.com',
          subject: 'Memory report',
          client: mocks.email
        }),
      'health',
      1
    )
  }
}).export(module);