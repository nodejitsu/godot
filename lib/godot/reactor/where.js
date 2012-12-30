/*
 * where.js: Stream for filtering events based on properties.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var util = require('util'),
    ReadWriteStream = require('../common/read-write-stream');

//
// ### function Where ([filters|key], value)
// #### @filters {Object} **Optional** Full set of key:value pairs to filter for
// #### @key {string} Key to filter against
// #### @value {string} Value of `key` to filter against.
// Constructor function of the Where stream responsible for filtering events
// based on properties. `new Where(filters)` or `new Where(key, value)` are
// the two ways to instantiate this stream.
//
var Where = module.exports = function (filters, value) {
  ReadWriteStream.call(this);

  if (typeof filters === 'object') {
    this.filters = filters;
  }
  else {
    this.key = filters;
    this.value = this.key === 'service'
      ? new RegExp(value.replace('*', '[^\\/]'))
      : value;
  }
};

//
// Inherit from ReadWriteStream
//
util.inherits(Where, ReadWriteStream);

//
// ### function write (data)
// #### @data {Object} JSON to filter
// Filters the specified `data` against `this.key`
// and `this.value` OR `this.filters`.
//
Where.prototype.write = function (data) {
  if (this.key) {
    if (this.key === 'service'
        && this.value.test(data.service)) {
      this.emit('data', data);
    }
    else if (data[this.key] === this.value) {
      this.emit('data', data);
    }
  }
  else if (this.filters) {
    //
    // TODO: Deal with this.filters case
    //
  }

  return true;
};