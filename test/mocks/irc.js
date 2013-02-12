/*
 * irc.js: Mock irc client for godot tests.
 *
 * @obazoud
 *
 */

//
// ### function send (options, callback)
// Immediately responds to the callback for irc sending.
//
exports.say = function (channels, message) {
};

exports.on = function (event, callback) {
  callback();
};