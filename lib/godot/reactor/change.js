/*
 * expire.js: Stream for filtering changes to properties on events.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var util = require('util'),
    ReadWriteStream = require('../common/read-write-stream');

//
// ### function Change ([keys|key0], key1, ...)
// #### @keys        {Array} **Optional** Full set of keys to watch for changes.
// #### @key0...keyn {string} Full set of keys to watch for changes.
// Constructor function of the Change stream responsible for filtering events
// based on changes to the properties represented by `keys` or `key0...keyn`.
// `new Change(keys)` or `new Change(key0, key1, ...)` are the two ways to
// instantiate this stream.
//
// TODO: Support more than strict value changes to keys.
//
var Change = module.exports = function () {
  ReadWriteStream.call(this);

  this.last = {};
  this.keys = Array.prototype.slice.call(arguments)
    .reduce(function (all, keys) {
      if (Array.isArray(keys)) {
        all = all.concat(keys);
      }
      else {
        all.push(keys);
      }

      return all;
    }, []);
};

//
// Inherit from ReadWriteStream
//
util.inherits(Change, ReadWriteStream);

//
// ### function write (data)
// #### @data {Object} JSON to filter
// Watches for changes to the `data` based on
// the set of `this.keys` this instance is setup
// to monitor.
//
Change.prototype.write = function (data) {
  var self = this,
      changed;

  changed = this.keys.some(function (key) {
    var diff = true;

    if (typeof self.last[key] === 'undefined'
        || self.last[key] === data[key]) {
      diff = false;
    }

    self.last[key] = data[key];
    return diff;
  });

  if (changed) {
    this.emit('data', data);
  }
};