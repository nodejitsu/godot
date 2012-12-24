/*
 * window.js: Weighted moving average, stdDev and percentiles.
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

/*
 *
 *  Args: 
 *  - alpha:
 *  - interval: time in milliseconds
 *
 */

//
// Emits relevant data for this instance at the current time.
//
var Window = module.exports = function Window(n, interval) {

  var that = this;

  this.n = n;
  this.interval = interval || 5000;

  // Data goes into a normal array, but the "start" and "end" of the data
  // don't coincide with the start and end of the array. This allows us to
  // avoid creating new arrays all the time.
  this.data = Array(this.n);

  this._ptr = 0; // resets at this.n
  this.size = 0; // stalls at this.n

  // For use with calculating percentiles.
  // The idea is to cache the sorted version of the data so that we may
  // calculate multiple percentiles more quickly.
  this.sortedData = [];
  this.sorted = false;

  this.uncounted = 0;
  this.tickInterval = setInterval(function(){ that.tick(); }, this.interval);

};

Window.prototype.update = function(n) {
  this.uncounted += (n || 1);
}

// 
// Update our rate measurements every interval
//
Window.prototype.tick = function tick () {

  var instantRate =  this.uncounted / this.interval

  // Push it on.
  this.data[this._ptr] = instantRate;

  this._ptr = (this._ptr + 1) % this.n;
  this.size = Math.max(this._ptr, this.size);

  // Sorted data is no longer fresh.
  this.sorted = false;

  return this;
};

//
// Helper for getting the current slice of data (that way we can still get
// stats for a window that isn't full yet)
//
Window.prototype.getData = function getData () {

  if (this.size === this.n) {
    return this.data;
  }
  else {
    return this.data.slice(0, this.size);
  }
}

//
// Helper for getting sorted (least-to-greatest) data points.
// This is used for calculating medians and percentiles.
//
Window.prototype.getSortedData = function getSortedData () {

  // If we don't have a sorted set of our datapoints, do it now.
  if (!this.sorted) {
    this.sortedData = this.getData().sort(function (a, b) {
      return a - b;
    });

    // Until we add a new datapoint, we're okay.
    this.sorted = true;
  }

  return this.sortedData;
}

//
// Calculate the mean.
//
Window.prototype.mean = function windowedMean () {

  return sum(this.getData()) / this.size;
};

//
// Calculate the standard deviation.
//
Window.prototype.stdDev = function windowedStdDev () {

  var variance = this.mean() + sum(this.getData()) / this.size;

  // Scale so we get sample variance (if we can avoid dividing by 0)
  if (this.size > 1) {
    variance *= (this.size / (this.size - 1 ) );
  }

  return Math.sqrt(variance);
};

//
// Calculate a desired percentile. Default percentile is 50%.
//
Window.prototype.getPercentile = function windowedStdDev (percent) {
  var p = (percent || 50)/100.0,
      data = this.getSortedData();
      index = p * this.size,
      over = index - Math.floor(index);

  index = Math.floor(index);

  // Linear interpolation, for odd cases.
  if (this.size) {
    return (1 - over) * data[index] + over * data[index + 1];
  }
  else {
    return 0;
  }
};

//
// Rates per second
//
Window.prototype.rate = function tick () {
  return {
    mean: this.mean() * 1000,
    stdDev: this.stdDev() * 1000,
    median: this.getPercentile() * 1000
  };
};