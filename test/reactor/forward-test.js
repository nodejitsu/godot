/*
 * forward-test.js: Tests for the Forward rector stream.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    godot = require('../../lib/godot'),
    ReadWriteStream = require('../../lib/godot/common/read-write-stream'),
    helpers = require('../helpers');
    
vows.describe('godot/reactor/forward').addBatch({
  "Godot forward": {
    topic: function () {
      var source = new ReadWriteStream(),
          reactors = {},
          that = this,
          stream,
          server;
      
      reactors.local = godot.reactor()
        .forward({
          type: 'tcp',
          host: 'localhost',
          port: 3371
        });
        
      reactors.remote = godot.reactor('remote')
        .where('service', '*/health');

      helpers.net.createServer({
        type: 'tcp',
        port: 3371,
        reactors: [reactors.remote]
      }, function (err, server) {
        //
        // Create a stream to write the test fixture to
        //
        stream = reactors.local.createStream(source);

        setTimeout(function () {
          //
          // Get the underlying stream for the connection
          // between the forward reactor and the remote server.
          //
          helpers.net.getStream(server, 'remote')
            .on('data', function (data) {
              that.data = that.data || [];
              that.data.push(data);
              
              if (that.data.length === 3) {
                that.callback(null);
              }
            });

          //
          // Write the test fixture to the local reactor.
          //
          helpers.reactor.writeFixture(source, 'health');
        }, 500);
      });      
    },
    "should forward the events to the remote server": function (err, _) {
      assert.isNull(err);
      assert.isArray(this.data);
      assert.lengthOf(this.data, 3);
    }
  }
}).export(module);