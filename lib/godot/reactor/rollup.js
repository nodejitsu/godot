/*
 * rollup.js: Stream for rolling up events over a given time interval.
 *
 * (C) 2012, Charlie Robbins, Jarrett Cruger, and the Contributors.
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
  if (!(this instanceof Rollup)) { return new Rollup(interval, limit) }
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

  this.limit      = options.limit    || 100;
  this.interval   = options.interval || 1000 * 60 * 60;
  this.forceReset = typeof interval === 'function';
  this.duration   = 0;
  this.period     = 0;
  this.events     = [];
  this.next       = [];
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
    //
    // Remark: Should we drop events here?
    //
    this.next.push(data);
  }
  else {
    this.events.push(data);
  }

  if (!this.intervalId) {
    this.resetInterval();
  }
};

//
// ### function resetInterval ()
// Resets the interval for this instance.
//
Rollup.prototype.resetInterval = function () {
  var self = this,
      nextInterval;

  //
  // Set the nextInterval to the calculated value
  // of the interval function or the static interval value.
  //
  nextInterval = typeof self.interval === 'function'
    ? self.interval(self.period, self.duration)
    : self.interval;

  if (this.intervalId) {
    clearInterval(this.intervalId);
  }

  this.intervalId = setInterval(function () {
    if (self.events.length) {
      self.duration += nextInterval;
      self.period   += 1;

      self.emit('data', self.events.slice());
      self.events.length = 0;

      for (var i = 0; i < self.next.length; i++) {
        self.events[i] = self.next[i];
      }

      self.next.length = 0;
      if (self.forceReset) {
        //
        // Remark: Basic unit testing was not effective to see if
        // this could cause StackOverflow exceptions. Process ran
        // out of memory before a StackOverflow exception was thrown.
        // A long running stress test would determine this.
        //
        self.resetInterval();
      }
    }
  }, nextInterval);
};
