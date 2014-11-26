/*
 * math.js: Simple math functions for godot windows.
 *
 * (C) 2012, Charlie Robbins, Jarrett Cruger, and the Contributors.
 *
 */

//
// ### function mean (events)
// #### @events {Array} Set of events to mean
// Returns the mean of all events with metric values.
//
exports.mean = function (events) {
  var counted = 0;
  return events.reduce(function (all, event) {
    if (typeof event.metric === 'number') {
      counted++;
      return all + event.metric
    }

    return all;
  }, 0) / counted;
};

//
// ### function sum (events)
// #### @events {Array} Set of events to sum.
// Returns the sum of all events with metric values.
//
exports.sum = function (events) {
  return events.reduce(function (all, event) {
    return typeof event.metric === 'number'
      ? all + event.metric
      : all;
  }, 0);
};

//
// ### function maximum (events)
// #### @events {Array} Set of events to process.
// Returns the max value of all events with metric values.
//
exports.maximum = function (events) {
  var max = events[0].metric;

  events.forEach(function (event) {
    if (typeof event.metric !== 'number') {
      return;
    }

    if (event.metric > max) {
      max = event.metric;
    }
  });

  return max;
};


//
// ### function minimum (events)
// #### @events {Array} Set of events to process.
// Returns the min value of all events with metric values.
//
exports.minimum = function (events) {
  var min = events[0].metric;

  events.forEach(function (event) {
    if (typeof event.metric !== 'number') {
      return;
    }

    if (event.metric < min) {
      min = event.metric;
    }
  });

  return min;
};