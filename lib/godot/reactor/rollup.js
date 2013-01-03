/*
 * rollup.js: Stream for rolling up events over a given time interval.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var util = require('util'),
    ReadWriteStream = require('../common/read-write-stream');

//
// ### function Rollup (interval)
// #### @interval {Number} Interval to rollup events over.
// Constructor function of the Rollup stream responsible for rolling
// up events over a given time interval. **Defaults to one hour rollup.**
//
var Rollup = module.exports = function (interval) {
  ReadWriteStream.call(this);
  this.interval = interval || 1000 * 60 * 60;
  this.events   = [];
  this.resetInterval();
};

//
// Inherit from ReadWriteStream
//
util.inherits(Rollup, ReadWriteStream);

//
// ### function write (data)
// #### @data {Object} JSON to rollup.
// Adds the specified `data` to the events
// rolled up by this instance.
//
Rollup.prototype.write = function (data) {
  this.events.push(data);
};

//
// ### function resetInterval ()
// Resets the interval for this instance.
//
Rollup.prototype.resetInterval = function () {
  var self = this;

  if (this.intervalId) {
    clearInterval(this.intervalId);
  }

  this.intervalId = setInterval(function () {
    for (var i = 0; i < self.events.length; i++) {
      self.emit('data', self.events[i]);
    }

    self.events.length = 0;
  }, this.interval);
};