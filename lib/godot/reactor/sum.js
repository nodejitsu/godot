/*
 * sum.js: Stream responsible for summing metrics on events.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var util = require('util'),
    ReadWriteStream = require('../common/read-write-stream');

//
// ### function Aggregate ()
// Constructor function of the Aggregate stream responsible for aggregating
// metrics on events.
//
var Sum = module.exports = function () {
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
// Watches for changes to the `data` based on
// the set of `this.keys` this instance is setup
// to monitor.
//
Sum.prototype.write = function (data) {
  this.total += data.metric;
  data.metric = this.total;
  this.emit('data', data);
};