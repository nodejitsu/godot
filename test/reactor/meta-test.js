/*
 * meta-test.js: Tests for the Meta reactor stream.
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

//
// Local test macro for ensuring that meta data for a
// simple average is added to the appropriate
// `timeSeries`.
//
function shouldAddSimpleAverage(timeSeries, assertFn) {
  return macros.shouldEmitDataSync(
    godot
      .reactor()
      .meta('avg', godot.reactor().movingAverage({
        average: 'simple',
        window: new windowStream.EventWindow({ size: 10 })
      })),
    timeSeries,
    100,
    function (all) {
      all.forEach(function (data, i) {
        var num = data.metric,
            di  = i + 1,
            avg, set;

        set = di < 10
          ? range(1, di)
          : range(di - 9, di);

        assert.isObject(data.meta);
        if (assertFn) {
          assertFn(data);
        }
        
        avg = data.meta.avg;
        assert.equal(num, di);
        assert.equal(avg, godot.math.mean(set.toArray().map(function (n) {
          return { metric: n };
        })));
      });
    }
  )
}

vows.describe('godot/reactor/meta').addBatch({
  "Godot": {
    "meta": {
      "with a simple movingAverage": {
        "with existing meta": shouldAddSimpleAverage(
          helpers.timeSeries({
            meta: { foo: 'bar' },
            metric: function (num) {
              return num;
            }
          }, 1000, 10),
          function (data) {
            assert.equal(data.meta.foo, 'bar');
          }
        ),
        "with no existing meta": shouldAddSimpleAverage(
          helpers.timeSeries({
            metric: function (num) {
              return num;
            }
          }, 1000, 10)
        )
      }
    },
    "hasMeta": {
      "all": {
        "with only keys": macros.shouldEmitDataSync(
          godot
            .reactor()
            .hasMeta('all', 'a', 'b', 'c'),
          'meta',
          5
        ),
        "with all values": macros.shouldEmitDataSync(
          godot
            .reactor()
            .hasMeta('all', { a: 1, b: 1, c: 1 }),
          'meta',
          5
        ),
        "with keys and values": macros.shouldEmitDataSync(
          godot
            .reactor()
            .hasMeta('all', { a: 1 }, 'b', 'c'),
          'meta',
          5
        ),
      },
      "any": {
        "with only keys": macros.shouldEmitDataSync(
          godot
            .reactor()
            .hasMeta('any', 'a'),
          'meta',
          10
        ),
        "with all values": macros.shouldEmitDataSync(
          godot
            .reactor()
            .hasMeta('any', { a: 1, b: 0, c: 0 }),
          'meta',
          10
        ),
        "with keys and values": macros.shouldEmitDataSync(
          godot
            .reactor()
            .hasMeta('any', 'a', { b: 0, c: 0 }),
          'meta',
          10
        ),
      }
    },
    "anyMeta": {
      "with only keys": macros.shouldEmitDataSync(
        godot
          .reactor()
          .anyMeta('a'),
        'meta',
        10
      ),
      "with all values": macros.shouldEmitDataSync(
        godot
          .reactor()
          .anyMeta({ a: 1, b: 0, c: 0 }),
        'meta',
        10
      ),
      "with keys and values": macros.shouldEmitDataSync(
        godot
          .reactor()
          .anyMeta('a', { b: 0, c: 0 }),
        'meta',
        10
      ),
    },
    "allMeta": {
      "with only keys": macros.shouldEmitDataSync(
        godot
          .reactor()
          .allMeta('a', 'b', 'c'),
        'meta',
        5
      ),
      "with all values": macros.shouldEmitDataSync(
        godot
          .reactor()
          .allMeta({ a: 1, b: 1, c: 1 }),
        'meta',
        5
      ),
      "with keys and values": macros.shouldEmitDataSync(
        godot
          .reactor()
          .allMeta({ a: 1 }, 'b', 'c'),
        'meta',
        5
      ),
    }
  }
}).export(module);