/*
 * mean.js: Stream responsible for calculating the mean of metrics on events.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var util = require('util'),
    ReadWriteStream = require('../common/read-write-stream');

//
// ### function Mean ()
// Constructor function of the Mean stream responsible for aggregating
// metrics on events.
//
var Mean = module.exports = function () {
  if (!(this instanceof Mean)) { return new Mean() }
  ReadWriteStream.call(this);
  this.total = 0;
  this.length = 0;
};

//
// Inherit from ReadWriteStream
//
util.inherits(Mean, ReadWriteStream);

//
// ### function write (data)
// #### @data {Object} JSON to filter
// Writes the data but updates the metric to
// be the mean of all `.metric` values over time.
//
Mean.prototype.write = function (data) {
  this.length++;
  this.total += data.metric;
  data.metric = this.total / this.length;
  this.emit('data', data);
};
