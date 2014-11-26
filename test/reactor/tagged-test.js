/*
 * tagged-test.js: Tests for the Tagged, TaggedAny, and TaggedAll reactor stream.
 *
 * (C) 2012, Charlie Robbins, Jarrett Cruger, and the Contributors.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    godot = require('../../lib/godot'),
    macros = require('../macros').reactor;

vows.describe('godot/reactor/tagged').addBatch({
  "Godot": {
    "tagged": {
      "all": macros.shouldEmitDataSync(
        godot
          .reactor()
          .tagged('all', 'a', 'b', 'c'),
        'tags',
        5
      ),
      "any": macros.shouldEmitDataSync(
        godot
          .reactor()
          .tagged('any', 'a'),
        'tags',
        10
      )
    },
    "taggedAny": macros.shouldEmitDataSync(
      godot
        .reactor()
        .taggedAny('a'),
      'tags',
      10
    ),
    "taggedAll": macros.shouldEmitDataSync(
      godot
        .reactor()
        .taggedAll('a', 'b', 'c'),
      'tags',
      5
    )
  }
}).export(module);