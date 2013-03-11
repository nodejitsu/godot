/*
 * tag-test.js: Tests for the Tag reactor stream.
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

vows.describe('godot/reactor/tag').addBatch({
  "Godot tag": {
    "with a simple movingAverage": macros.shouldEmitDataSync(
      godot
        .reactor()
        .tag('avg', godot.reactor().movingAverage({
          average: 'simple',
          window: new windowStream.EventWindow({ size: 10 })
        })),
      helpers.timeSeries({
        metric: function (num) {
          return num;
        }
      }, 1000, 10),
      100,
      function (all) {
        all.forEach(function (data, i) {
          var num = data.metric,
              di  = i + 1,
              avg, set;

          set = di < 10
            ? range(1, di)
            : range(di - 9, di);

          avg = data.tags.filter(function (tag) {
            return tag.indexOf('avg') !== -1
          })[0];

          assert.equal(num, di);
          assert.isString(avg);

          avg = parseFloat(avg.split(':')[1], 10);
          assert.equal(avg, godot.math.mean(set.toArray().map(function (n) {
            return { metric: n };
          })));
        });
      }
    )
  }
}).export(module);