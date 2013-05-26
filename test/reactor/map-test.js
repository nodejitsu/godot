/*
 * map-test.js: Tests for the Map reactor stream.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    godot = require('../../lib/godot'),
    macros = require('../macros').reactor;

vows.describe('godot/reactor/map').addBatch({
  "Godot map": macros.shouldHaveMetricSync(
    godot
      .reactor()
      .map(function (data) {
        data.metric = data.metric * 3;
        return data;
      }),
    'pings',
    3
  ),
  "Godot map async": macros.shouldHaveMetric(
    godot
      .reactor()
      .map(function (data, callback) {
        data.metric = data.metric * 3;
        process.nextTick(function () {
          callback(null, data);
        });
      }),
    'health',
    3
  ),
  "Godot map error": macros.shouldErrorSync(
    godot
      .reactor()
      .map(function (data, callback) {
        callback(new Error('ERMAHGERD'), null);
      }),
    'health'
  )
}).export(module);
