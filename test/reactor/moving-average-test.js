/*
 * moving-average-test.js: Tests for the MovingAverage reactor stream.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    range = require('r...e'),
    windowStream = require('window-stream'),
    godot = require('../../lib/godot'),
    helpers = require('../helpers'),
    macros = require('../macros').reactor;

var M1_ALPHA = 1 - Math.exp(-5/60);

vows.describe('godot/reactor/moving-average').addBatch({
  "Godot movingAverage": {
    "simple": macros.shouldEmitDataSync(
      godot
        .reactor()
        .movingAverage({
          average: 'simple',
          window: new windowStream.EventWindow({ size: 10 })
        }),
      helpers.timeSeries({ 
        metric: function (num) {
          return num;
        }
      }, 1000, 10),
      100,
      function (all) {
        all.map(function (data) {
          return data.metric;
        }).forEach(function (num, i) {
          var di  = i + 1,
              set = di < 10
                ? range(1, di)
                : range(di - 9, di);
          
          assert.equal(num, godot.math.mean(set.toArray().map(function (n) {
            return { metric: n };
          })));
        });
      }
    ),
    "weighted": macros.shouldEmitDataSync(
      godot
        .reactor()
        .movingAverage({
          average: {
            type: 'weighted',
            weights: [
              0, 0, 0, 0, 0,
              0, 0, 0, 0, 1
            ]
          },
          window: new windowStream.EventWindow({ size: 10 })
        }),
      helpers.timeSeries({ 
        metric: function (num) {
          return num;
        }
      }, 1000, 10),
      100,
      function (all) {
        all.map(function (data) {
          return data.metric;
        }).forEach(function (num, i) {
          var di = i + 1,
              divisor = di < 10 ? di : 10;
          
          assert.equal(num, di / ((divisor * (divisor + 1)) / 2));
        });
      }
    ),
    "exponential": macros.shouldEmitDataSync(
      godot
        .reactor()
        .movingAverage({
          average: {
            type: 'exponential',
            alpha: M1_ALPHA
          },
          window: new windowStream.EventWindow({ size: 10 })
        }),
      helpers.timeSeries({ 
        metric: function (num) {
          return num;
        }
      }, 1000, 10),
      100
    )
  }
}).export(module);