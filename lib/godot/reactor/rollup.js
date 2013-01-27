/*
 * rollup.js: Stream for rolling up events over a given time interval.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var util = require('util'),
    ReadWriteStream = require('../common/read-write-stream');

//
// ### function Rollup (options, || interval, limit)
// #### @options {Object} Options for this instance
// #### @[options.]limit    {Number} Number of events for each interval.
// #### @[options.]interval {Number} Interval to rollup events over.
// Constructor function of the Rollup stream responsible for rolling
// up events over a given time interval. **Defaults to one hour rollup.**
//
var Rollup = module.exports = function (interval, limit) {
  ReadWriteStream.call(this);

  var options;

  if (typeof interval === 'object') {
    options = interval;
  }
  else {
    options = {
      interval: interval,
      limit: limit
    };
  }

  this.interval = options.interval || 1000 * 60 * 60;
  this.limit    = options.limit    || 100;
  this.events   = [];
  this.next     = [];
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
  if (this.events.length === this.limit) {
    this.next.push(data);
  }
  else {
    this.events.push(data);
  }
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
    if (self.events.length) {
      self.emit('data', self.events.slice());
      self.events.length = 0;

      for (var i = 0; i < self.next.length; i++) {
        self.events[i] = self.next[i];
      }

      self.next.length = 0;
    }
  }, this.interval);
};