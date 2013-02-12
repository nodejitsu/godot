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
          server: 'irc.test.net',
          nick: 'gobot',
          bot: mocks.irc,
          options: { 
            channels: ['#gotbottest']
          }
        }),
      'health',
      1
    ),
    "interval": macros.shouldEmitDataSync(
      godot
        .reactor()
        .where('service', '*/health/heartbeat')
        .irc({
          server: 'irc.test.net',
          nick: 'gobot',
          interval: 60 * 60 * 1000,
          bot: mocks.irc,
          options: { 
            channels: ['#gotbottest']
          }
        }),
      'health',
      1
    )
  }
}).export(module);