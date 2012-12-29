/*
 * ewma.js: Exponentially Weighted Moving Averages with Std Deviations.
 * Window: Weighted moving average, stdDev and percentiles.
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

/*
 *
 *  Args: 
 *  - alpha:
 *      var M1_ALPHA = 1 - Math.exp(-5/60);
 *      var M5_ALPHA = 1 - Math.exp(-5/60/5);
 *      var M15_ALPHA = 1 - Math.exp(-5/60/15);
 *  - interval: time in milliseconds
 *  - type: either 'time' or 'math'
 *
 */

var EWMA = module.exports = function(alpha, interval, type) {

  var that = this;
  this.alpha = alpha;
  this.interval = interval || 5000;
  this.initialized = false;
  this.type = type;
  this.current = {
    mean: 0.0,
    meanOfSquares: 0.0,
    variance: 0.0
  };
  this.uncounted = 0;
  this.updates = 0;
  if (interval) {
    this.tickInterval = setInterval(function(){ that.tick(); }, interval);
  }
}

EWMA.prototype.update = function(n) {
  this.uncounted += (n || 1);
  this.updates++;
}

// 
// Update our rate measurements every interval
// 
EWMA.prototype.tick = function() {
  var instantRate = this.uncounted;
  
  if (this.type === 'time') {
    instantRate = instantRate / this.interval;
  } else if (this.type === 'math') {
    instantRate = instantRate / (this.updates || 1);
  }

  this.uncounted = 0;
  this.updates = 0;

  if(this.initialized) {

    this.current.mean = this.alpha * instantRate
      + (1 - this.alpha) * this.current.mean;

    this.current.variance = this.alpha * Math.pow(instantRate - this.current.mean, 2)
      + (1 - this.alpha) * this.current.variance;
  } else {

    this.current.mean = instantRate;
    this.current.variance = 0.0;

    this.initialized = true;
  }
};

// 
// Return the rate per second
// 
EWMA.prototype.rate = function() {
  return {
    mean: this.current.mean * 1000,
    stdDev: Math.sqrt(this.current.variance) * 1000
  };
};