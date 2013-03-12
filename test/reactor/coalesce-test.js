/*
 * coalesce-test.js: Tests for the Coalesce reactor stream.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    godot = require('../../lib/godot'),
    macros = require('../macros').reactor;

vows.describe('godot/reactor/coalesce').addBatch({
  "Godot coalesce": macros.shouldEmitDataSync(
    godot
      .reactor()
      .coalesce(),
    'coalesce',
    4,
    function (events) {
      [1, 2, 3, 3].forEach(function (len, i) {
        assert.lengthOf(events[i], len);
      })
    }
  )
}).export(module);