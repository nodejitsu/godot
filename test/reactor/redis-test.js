/*
 * redis-test.js: Tests for the Redis reactor stream
 *
 * (C) 2013, Nodejitsu Inc.
 *
 */

var vows = require('vows'),
    godot = require('../../lib/godot'),
    macros = require('../macros').reactor,
    mocks = require('../mocks');

vows.describe('godot/reactor/redis').addBatch({
  "Godot redis": macros.shouldEmitDataSync(
    godot
      .reactor()
      .where('service', '*/health/memory')
      .redis({
        client: mocks.redis
      }, function (client, data, callback) {
        // Do something with redis of your choosing
        process.nextTick(function () {
          callback(null, data);
        });
      }),
    'health',
    1
  )
}).export(module);
