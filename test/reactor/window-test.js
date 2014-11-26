/*
 * window-test.js: Tests for the *Window and Combine reactor streams.
 *
 * (C) 2012, Charlie Robbins, Jarrett Cruger, and the Contributors.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    godot = require('../../lib/godot'),
    helpers = require('../helpers'),
    macros = require('../macros').reactor;

vows.describe('godot/reactor/window').addBatch({
  "Godot eventWindow": {
    "{ fixed: true, size: 3 }": macros.shouldHaveMetricSync(
      godot
        .reactor()
        .eventWindow({
          fixed: true,
          size: 3
        })
        .combine(godot.math.sum),
      'pings',
      3
    ),
    "{ fixed: false, size: 1 }": macros.shouldEmitDataSync(
      godot
        .reactor()
        .eventWindow({
          fixed: false,
          size: 1
        }),
      'pings',
      3,
      function (all) {
        all.forEach(function (set) {
          assert.lengthOf(set, 1);
        });
      }
    )
  },
  "Godot timeWindow": {
    "{ fixed: true, duration: 1000 }": macros.shouldHaveMetricSync(
      godot
        .reactor()
        .timeWindow({
          fixed: true,
          duration: 1000
        })
        .combine(godot.math.sum),
      helpers.timeSeries({
        service: 'timewindow/test',
        metric: 1
      }, 2000, 100),
      10
    ),
    "{ fixed: false, duration: 1000 }": macros.shouldEmitData(
      godot
        .reactor()
        .timeWindow({
          fixed: false,
          duration: 500
        }),
      helpers.timeSeries({
        service: 'timewindow/test',
        metric: 1
      }, 500, 50),
      1,
      600,
      function (all) {
        assert.lengthOf(all[0], 10);
      }
    )
  }
}).export(module);