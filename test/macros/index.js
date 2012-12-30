/*
 * index.js: Top-level include for tests macros.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */
 
var assert = require('assert'),
    helpers = require('../helpers'),
    ReadWriteStream = require('../../lib/godot/common/read-write-stream');

exports.shouldEmitData = function (reactor, fixture, length) {
  return {
    topic: function () {
      var that = this,
          source = new ReadWriteStream(),
          stream = reactor.createStream(source);
      
      this.data = [];
      
      stream.on('end', this.callback);
      stream.on('data', function (data) {
        that.data.push(data);
      });
      
      helpers.writeFixture(stream, fixture);
    },
    "should filter the appropriate events": function () {
      assert.lengthOf(this.data, length);
    }
  };
};