/*
 * sms.js: Mock SMS client for godot tests.
 *
 * (C) 2012, Charlie Robbins, Jarrett Cruger, and the Contributors.
 *
 */

//
// ### @SMS {Object}
// Mock SMS object for godot tests.
//
exports.SMS = {
  //
  // ### function send (options, callback)
  // Immediately responds to the callback for email sending.
  //
  send: function (options, callback) {
    callback();
  }
};