/*
 * reactor-test.js: Basic tests for the reactor module.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    godot = require('../../lib/godot');

vows.describe('godot/reactor').addBatch({
  "Godot reactor": {
    "should have the correct primiatives": function () {
      ['change',
       'email',
       'expire',
       'forward',
       'mean',
       'rollup',
       'sms',
       'sum',
       'tagged',
       'taggedAny',
       'taggedAll',
       'throttle',
       'where'].forEach(function (method) {
         assert.isFunction(godot.reactor.Reactor.prototype[method]);
       });
    },
    "the register() method": {
      "when redefining a method": function () {
        assert.throws(
          function () {
            godot.reactor.register('expire', function () {})
          },
          /Cannot redefine/
        );
      }
    }
  }
}).export(module);