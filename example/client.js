/*
 * client.js :: A client example showing 2 generic producers
 *
 * (C) 2013 Nodejitsu Inc.
 *
 */

var godot = require('../lib/godot');

//
// This client will expire only once you turn off this client script
//
godot.createClient({
  type: 'tcp',
  producers: [
    godot.producer({
      host: '127.0.0.1',
      service: 'ohai/there',
      ttl: 1000 * 4
    })
  ]
}).connect(1337);

//
// This client will expire on the first tick
//
godot.createClient({
  type: 'tcp',
  producers: [
    godot.producer({
      host: '127.0.0.1',
      service: 'new/things',
      ttl: 1000 * 6
    })
  ]
}).connect(1337);
