/*
 * count.js: Stream responsible for emitting number of messages over an interval.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var util = require('util'),
    common = require('../common'),
    ReadWriteStream = common.ReadWriteStream;

//
// ### function Count (interval)
// #### @interval {number} Interval in ms to count messages over.
// Constructor function of the Count stream responsible for emitting
// number of messages over an interval.
//
var Count = module.exports = function (interval) {
  if (typeof interval !== 'number') {
    throw new Error('interval is required.');
  }

  ReadWriteStream.call(this);
  this._name = 'count';
  this.interval = interval;
  this.count    = 0;
};

//
// Inherit from ReadWriteStream
//
util.inherits(Count, ReadWriteStream);

//
// ### function write (data)
// #### @data {Object} JSON to filter
// Emits data only if `.metric` is over `this.ceiling`.
//
Count.prototype.write = function (data) {
  if (typeof data.metric === 'number') {
    this.count += 1;
    this.last = data;
  }

  if (!this.intervalId) {
    this.resetInterval();
  }
};

//
// ### function resetInterval ()
// Resets the count for this instance on the
// specified `this.interval`.
//
Count.prototype.resetInterval = function () {
  var self = this;

  if (this.intervalId) {
    clearInterval(this.intervalId);
  }

  this.intervalId = setInterval(function () {
    if (self.count) {
      var data = common.clone(self.last);
      data.metric = self.count;
      data.time   = +Date.now();
      data.tags   = data.tags || [];
      data.tags.push('per ' + (self.interval / 1000) + 's');
      
      self.emit('data', data);
      self.count = 0;
      self.last  = null;
    }
  }, this.interval);
};