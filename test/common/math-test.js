/*
 * math-test.js: Basic tests for the godot `math` module.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    range = require('r...e'),
    vows = require('vows'),
    godot = require('../../lib/godot');

vows.describe('godot/math').addBatch({
  "Godot.math": {
    "1...100": {
      topic: range(1, 100).toArray().map(function (num) {
        return { metric: num };
      }),
      "mean": function (events) {
        assert.equal(godot.math.mean(events), 101 / 2);
      },
      "sum": function (events) {
        assert.equal(godot.math.sum(events), 101 * 50);
      },
      "maximum": function (events) {
        assert.equal(godot.math.maximum(events), 100);
      },
      "minimum": function (events) {
        assert.equal(godot.math.minimum(events), 1);
      }
    }
  }
}).export(module);