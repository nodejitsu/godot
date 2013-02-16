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
 	switch(event) {
    case 'join':
      callback('godot!~godot@xxx.xxx.com', '#godotirc');
      break;
    case 'kick':
      callback('olivier__!~olivier@xxx.xxx.com', '#godotirc', 'godotirc');
      break;
    default:
      callback();
  }
};