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
       'combine',
       'email',
       'eventWindow',
       'expire',
       'forward',
       'map',
       'mean',
       'over',
       'rate',
       'rollup',
       'sms',
       'sum',
       'tagged',
       'taggedAny',
       'taggedAll',
       'throttle',
       'timeWindow',
       'under',
       'where',
       'within'].forEach(function (method) {
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