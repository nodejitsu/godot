/*
 * redis.js: Mock Redis client for godot tests.
 *
 * (C) 2013, Charlie Robbins, Jarrett Cruger, and the Contributors.
 *
 */

//
// ### function SETBIT(key, offset, value, callback)
// Immediately Responds to the callback to imitate setbit
//
exports.SETBIT = function (key, offset, value, callback) {
  callback();
};
