/*
 * index.js: Top-level include for tests helpers.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var fs = require('fs'),
    path = require('path'),
    range = require('r...e');

//
// Expose the root directory.
//
var testRoot = path.join(__dirname, '..'),
    port = 10556;

//
// ### @dirs {Object}
// Paths to all test directories
//
var dirs = exports.dirs = fs.readdirSync(testRoot)
  .reduce(function (all, dir) {
    all[dir] = path.join(testRoot, dir);
    return all;
  }, {});

//
// ### @fixtures {Object}
// Fully parsed set of test fixtures
//
var fixtures = exports.fixtures = fs.readdirSync(dirs.fixtures)
  .reduce(function (all, file) {
    file = file.replace('.json', '');
    all[file] = require(path.join(dirs.fixtures, file));
    return all;
  }, {});

//
// ### @nextPort {number}
// Next available port for testing.
//
Object.defineProperty(exports, 'nextPort', {
  get: function () {
    return ++port;
  }
});

//
// ### function timeSeries(event, length, duration)
// #### @event    {Object} Base event to use for all properties except time.
// #### @length   {number} Length of the total time interval.
// #### @duration {number} Length of the interval between each event.
// Returns a time series based on the specified event.
//
exports.timeSeries = function (event, length, duration) {
  var intervals = Math.floor(length / duration),
      now = +Date.now();

  return range(1, intervals).map(function (interval) {
    return Object.keys(event).reduce(function reduceKey(obj, key) {
      if (typeof event[key] === 'function') {
        obj[key] = event[key](interval)
      }
      else if (Array.isArray(event[key])) {
        obj[key] = event[key].slice();
      }
      else if (typeof event[key] === 'object') {
        obj[key] = Object.keys(event[key]).reduce(function (value, kkey) {
          value[kkey] = event[key][kkey];
          return value;
        }, {});
      }
      else {
        obj[key] = event[key];
      }

      return obj;
    }, { time: now + (interval * duration) });
  });
};

//
// Expose module specific helpers
//
exports.net     = require('./net');
exports.reactor = require('./reactor');
exports.run     = require('./run');