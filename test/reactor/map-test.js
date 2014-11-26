/*
 * map-test.js: Tests for the Map reactor stream.
 *
 * (C) 2012, Charlie Robbins, Jarrett Cruger, and the Contributors.
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
  "Godot map async, fire and forget async call": macros.shouldHaveMetric(
    godot
      .reactor()
      .map(function (data, callback) {
        process.nextTick(function () {
          callback(null, data);
        });
      }, { passThrough: true }),
    'fireForget',
    1
  ),
  "Godot map error, regular async": macros.shouldErrorSync(
    godot
      .reactor()
      .map(function (data, callback) {
        callback(new Error('ERMAHGERD'), null);
      }),
    'health'
  ),
  "Godot map error, fire and forget": macros.shouldError(
    godot
      .reactor()
      .map(function (data, callback) {
        process.nextTick(function () {
          callback(new Error('ohaithere'), null);
        });
      }, { passThrough: true }),
    'fireForget'
  )
}).export(module);
