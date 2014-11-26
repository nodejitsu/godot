/*
 * email.js: Mock email client for godot tests.
 *
 * (C) 2012, Charlie Robbins, Jarrett Cruger, and the Contributors.
 *
 */

//
// ### function send (options, callback)
// Immediately responds to the callback for email sending.
//
exports.send = function (options, callback) {
  callback();
};