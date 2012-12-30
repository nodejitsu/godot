/*
 * duplex-test.js: Basic tests for duplex godot Client/Server communication.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    godot = require('../../lib/godot'),
    helpers = require('../helpers'),
    macros = require('../macros').net;
    
vows.describe('godot/net/duplex').addBatch({
  "Godot duplex": {
    "udp": macros.shouldDuplex(
      { 
        type: 'udp',
        port: 1337,
        reactors: [
          godot.reactor('where-expire')
            .where('service', 'godot/test')
            .expire(200),
          godot.reactor('where')
            .where('service', 'godot/test')
        ],
        producers: [
          godot.producer(helpers.fixtures['producer-test'])
        ]
      },
      {
        "after the default TTL": {
          topic: function () {
            setTimeout(this.callback.bind(this), 200);
          },
          "server should have connections and reactors": function () {
            var server = this.server;
            assert.isObject(server.reactors);
            assert.isObject(server.hosts);
          },
          "client should have connection, producers, and handlers": function () {
            var client = this.client;
            assert.isObject(client.producers);
            assert.isObject(client.handlers);
          }
        }
      }
    )
  }
}).export(module);