/*
 * reactor-test.js: Basic tests for the reactor module.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    utile = require('utile'),
    vows = require('vows'),
    godot = require('../../lib/godot');

vows.describe('godot/reactor').addBatch({
  "Godot reactor": {
    "should have the correct primiatives": function () {
      var reactorDir = path.join(__dirname, '..', '..', 'lib', 'godot', 'reactor'),
          core = ['index.js', 'reactor.js'];

      fs.readdirSync(reactorDir)
        .filter(function (file) {
          return !~core.indexOf(file);
        })
        .forEach(function (file) {
          var name   = file.replace('.js', ''),
              parts  = name.split('-'),
              method = parts[0];

          if (parts.length > 1) {
            method += utile.capitalize(parts[1]);
          }

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