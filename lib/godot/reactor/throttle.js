/*
 * throttle.js: Stream for throttling events over a given time interval.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var util = require('util'),
    ReadWriteStream = require('../common/read-write-stream');

//
// ### function Throttle (length|options, interval)
// #### @options  {Object} Options containing max and interval
// #### @max      {Number} Maximum number of events to emit before throttleing.
// #### @interval {Number} Interval to throttle events over.
// Constructor function of the Throttle stream responsible for throttling
// events over a given time interval. **Defaults to 10 event maximum and
// five minute interval.**
//
var Throttle = module.exports = function (max, interval) {
  if (!(this instanceof Throttle)) { return new Throttle(max, interval) }
  var options;

  if (typeof max === 'object') {
    options = max;
  }
  else {
    options = {
      max: max,
      interval: interval
    };
  }

  ReadWriteStream.call(this);
  this.max      = options.max      || 10;
  this.interval = options.interval || 1000 * 60 * 5;
  this.length   = 0;
};

//
// Inherit from ReadWriteStream
//
util.inherits(Throttle, ReadWriteStream);

//
// ### function write (data)
// #### @data {Object} JSON to rollup.
// Emits the specified `data` only if we have not
// emitted `this.max` events over `this.interval`.
//
Throttle.prototype.write = function (data) {
  //
  // If we've passed the `max` number of events
  // to emit, then drop this `data`.
  //
  if (this.max <= this.length) {
    return;
  }

  this.emit('data', data);
  this.length += 1;

  if (!this.intervalId) {
    this.resetInterval();
  }
};

//
// ### function resetInterval ()
// Resets the length of this instance on the
// specified `this.interval` for this instance.
//
Throttle.prototype.resetInterval = function () {
  var self = this;

  if (this.intervalId) {
    clearInterval(this.intervalId);
  }

  this.intervalId = setInterval(function () {
    self.length = 0;
  }, this.interval);
};
