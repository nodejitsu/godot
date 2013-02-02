/*
 * reactor.js: Starts a single reactor with options passed over child IPC.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var godot = require('../../../lib/godot'),
    helpers = require('../index');

//
// Starts the reactor server
//
function start(options) {
  helpers.net.createServer({
    type:      options.type,
    port:      options.port,
    multiplex: false,
    reactors:  [
      godot.reactor()
        .count(1000)
        .console()
    ]
  }, function (err) {
    return err
      ? process.send({ error: err })
      : process.send({ started: true });
  });
}

process.once('message', start);