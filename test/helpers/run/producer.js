/*
 * producer.js: Starts a single producer with options passed over child IPC.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var godot = require('../../../lib/godot'),
    helpers = require('../index');

//
// Starts the producer client
//
function start(options) {
  helpers.net.createClient({
    type: options.type,
    port: options.port,
    producers: [
      godot.producer(options.produce)
    ]
  }, function (err) {
    return err
      ? process.send({ error: err })
      : process.send({ started: true });
  });
}

process.once('message', start);