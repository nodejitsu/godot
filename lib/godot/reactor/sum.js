/*
 * sum.js: Stream responsible for summing metrics on events.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var util = require('util'),
    ReadWriteStream = require('../common/read-write-stream');

//
// ### function Sum ()
// Constructor function of the Sum stream responsible for aggregating
// metrics on events.
//
var Sum = module.exports = function () {
  if (!(this instanceof Sum)) { return new Sum() }
  ReadWriteStream.call(this);
  this.total = 0;
};

//
// Inherit from ReadWriteStream
//
util.inherits(Sum, ReadWriteStream);

//
// ### function write (data)
// #### @data {Object} JSON to filter
// Writes the data but updates the metric to
// be the sum of all `.metric` values over time.
//
Sum.prototype.write = function (data) {
  this.total += data.metric;
  data.metric = this.total;
  this.emit('data', data);
};
