/*
 * rate.js: Stream responsible for emitting summing metrics over an interval and 
 *          divide by interval size.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var util = require('util'),
    common = require('../common'),
    ReadWriteStream = common.ReadWriteStream;

//
// ### function Over (ceiling)
// #### @ceiling {number} Ceiling value to compare to `.metric` values.
// Constructor function of the Over stream responsible for emitting
// summing metrics over an interval and divide by interval size.
//
var Rate = module.exports = function (interval) {
  if (typeof interval !== 'number') {
    throw new Error('interval is required.');
  }

  ReadWriteStream.call(this);
  this.interval = interval;
  this.sum      = 0;
  this.size     = 0;
};

//
// Inherit from ReadWriteStream
//
util.inherits(Rate, ReadWriteStream);

//
// ### function write (data)
// #### @data {Object} JSON to filter
// Emits data only if `.metric` is over `this.ceiling`.
//
Rate.prototype.write = function (data) {
  if (typeof data.metric === 'number') {
    this.sum  += data.metric;
    this.size += 1;
    this.last = data;
  }

  if (!this.intervalId) {
    this.resetInterval();
  }
};

//
// ### function resetInterval ()
// Resets the sum for this instance on the
// specified `this.interval`.
//
Rate.prototype.resetInterval = function () {
  var self = this;

  if (this.intervalId) {
    clearInterval(this.intervalId);
  }

  this.intervalId = setInterval(function () {
    if (self.size) {
      var data = common.clone(self.last);
      data.metric = self.sum / self.size;
      data.time   = +Date.now();
      self.emit('data', data);
      self.sum  = 0;
      self.size = 0;
      self.last = null;
    }
  }, this.interval);
};