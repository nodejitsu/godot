/*
 * irc-test.js: Tests for the IRC reactor stream.
 *
 * @obazoud
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    godot = require('../../lib/godot'),
    macros = require('../macros').reactor,
    mocks = require('../mocks');

vows.describe('godot/reactor/irc').addBatch({
  "Godot irc": {
    "no interval": macros.shouldEmitDataSync(
      godot
        .reactor()
        .where('service', '*/health/memory')
        .irc({
          host: 'irc.test.net',
          nick: 'godot',
          channels: ['#godotirc'],
          client: mocks.irc,
        }),
      'health',
      1
    ),
    "interval": macros.shouldEmitDataSync(
      godot
        .reactor()
        .where('service', '*/health/heartbeat')
        .irc({
          host: 'irc.test.net',
          nick: 'godot',
          channels: ['#godotirc'],
          client: mocks.irc,
          interval: 60 * 60 * 1000
        }),
      'health',
      1
    )
  }
}).export(module);