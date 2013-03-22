/*
 * index.js: Top-level include for common godot utility functions.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

//
// ### function clone (data)
// Returns a copy of the data event.
//
exports.clone = function (data) {
  return Object.keys(data).reduce(function (obj, key) {
    if (key === 'tags') {
      obj[key] = data[key].slice()
    }
    else if (key === 'meta') {
      //
      // TODO: Fast close meta
      //
      obj[key] = data[key];
    }
    else {
      obj[key] = data[key];
    }

    return obj;
  }, {});
};

//
// ### @ReadWriteStream {function}
// Constructor function for the base ReadWriteStream
//
exports.ReadWriteStream = require('./read-write-stream');

//
// ### @JsonParser {function}
// Constructor function for the godot streaming JsonParser
//
exports.JsonParser = require('./json-parser');

//
// ### @FilterStream {function}
// Constructor function for the base FilterStream
//
exports.FilterStream = require('./filter-stream');
