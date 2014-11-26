/*
 * index.js: Top-level include for common godot utility functions.
 *
 * (C) 2012, Charlie Robbins, Jarrett Cruger, and the Contributors.
 *
 */

var clone = require('clone');

//
// ### function clone (data)
// Returns a copy of the data event.
//
exports.clone = function (data) {
  return clone(data, false);
};

//
// ### @ReadWriteStream {function}
// Constructor function for the base ReadWriteStream
//
exports.ReadWriteStream = require('./read-write-stream');

//
// ### @FilterStream {function}
// Constructor function for the base FilterStream
//
exports.FilterStream = require('./filter-stream');
