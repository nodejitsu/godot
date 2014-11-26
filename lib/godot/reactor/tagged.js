/*
 * tagged.js: Stream for filtering events with a given tag (or set of tags).
 *
 * (C) 2012, Charlie Robbins, Jarrett Cruger, and the Contributors.
 *
 */

var util = require('util'),
    ReadWriteStream = require('../common/read-write-stream');

//
// ### function Tagged ([type], tags|tag0, tag1, ..., tagN)
// #### @type {any|all} Type of tag filtering to perform: any or all.
// #### @tags|tag0..tagN {Array|arguments} Full set of tags to filter over.
// Constructor function of the Tagged stream responsible for filtering
// events with a given tag (or set of tags).
//
var Tagged = module.exports = function (type) {
  if (!(this instanceof Tagged)) { return new Tagged(type) }
  ReadWriteStream.call(this);

  var tags = Array.prototype.slice.call(arguments);

  if (type === 'any' || type === 'all') {
    this.type = type;
    tags.splice(0, 1);
  }
  else {
    this.type === 'any';
  }

  this.tags = tags.reduce(function (all, tags) {
    if (Array.isArray(tags)) {
      all = all.concat(tags);
    }
    else {
      all.push(tags);
    }

    return all;
  }, []);
};

//
// Inherit from ReadWriteStream
//
util.inherits(Tagged, ReadWriteStream);

//
// ### function write (data)
// #### @data {Object} JSON to rollup.
// Only filters `data` according to `this.tags`.
//
Tagged.prototype.write = function (data) {
  //
  // If there are no tags on the data return
  //
  if (!data.tags || !data.tags.length) {
    return;
  }

  //
  // Helper function for checking a given `tag`.
  //
  function hasTag(tag) {
    return data.tags.indexOf(tag) !== -1;
  }

  var valid = this.type === 'all'
    ? this.tags.every(hasTag)
    : this.tags.some(hasTag);

  if (!valid) {
    return;
  }

  this.emit('data', data);
};
