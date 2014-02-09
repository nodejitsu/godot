/*
 * reactor.js: Top-level include for the `reactors` module responsible processing and reacting to events.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var fs = require('fs'),
    path = require('path'),
    utile = require('utile');

//
// Core files which should not be exported as reactors.
//
var core = ['index.js', 'reactor.js'];

//
// ### function reactor (options)
// #### @options {Object} Options to use when instantiating this reactor
// Creates a new prototypal Reactor for later instantiation.
//
var reactor = module.exports = function (godot) {
  //
  // Register the appropriate reactors
  //
  fs.readdirSync(__dirname)
    .filter(function (file) {
      return !~core.indexOf(file) && path.extname(file) === '.js';
    })
    .forEach(function (file) {
      var name   = file.replace('.js', ''),
          parts  = name.split('-'),
          method = parts[0];

      if (parts.length > 1) {
        method += utile.capitalize(parts[1]);
      };
      godot[method] = require('./' + name);
    });
};

