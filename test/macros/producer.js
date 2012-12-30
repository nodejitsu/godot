/*
 * producer.js: Test macros for godot producers.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    helpers = require('../helpers'),
    godot = require('../../lib/godot'),
    Producer = godot.producer.Producer;

//
// ### function shouldThrowOnInvalidValues()
// Ensures that a given producer throws when attempting to
// set a key ('ttl', 'host', etc) with an invalid value.
//
exports.shouldThrowOnInvalidValues = function () {
  return Object.keys(Producer.prototype.types)
    .reduce(function (context, key) {
      //
      // Create a test in the `context` for each of the setters
      // when passed an invalid value.
      //
      var factory = {
        'string': function () { return 0 },
        'number': function () { return '0' },
        'array':  function () { return 0 }
      }
      
      context[key] = function (producer) {
        var type    = Producer.prototype.types[key],
            invalid = factory[type]();
            
        assert.throws(function () {
          producer[key](invalid)
        }, 'Type mismatch: ' + key + ' must be a ' + type);
      };
      
      return context;
    }, {});
};

//
// ### function shouldThrowOnInvalidValues()
// Ensures that a given producer sets a key ('ttl', 'host', etc)
// with an valid value.
//
exports.shouldSetValues = function () {
  return Object.keys(Producer.prototype.types)
    .reduce(function (context, key) {
      //
      // Create a test in the `context` for each of the setters
      // when passed an value. Use the existing values to avoid
      // conflicts with later tests.
      //
      context[key] = function (producer) {
        value = this.values[key];
        assert.equal(producer[key](value), producer)
      };
  
      return context;
    }, {});
};