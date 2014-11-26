/*
 * rollup-test.js: Tests for the Rollup reactor stream.
 *
 * (C) 2012, Charlie Robbins, Jarrett Cruger, and the Contributors.
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
    ),
    "function as interval": macros.shouldEmitData(
      godot
        .reactor()
        .rollup(function (period) {
          return period * 100;
        }, 2),
      'health',
      2,
      200
    )
  }
}).export(module);
