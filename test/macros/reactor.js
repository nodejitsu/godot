/*
 * reactor.js: Test macros for godot reactors.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    helpers = require('../helpers').reactor,
    ReadWriteStream = require('../../lib/godot/common/read-write-stream');

//
// ### function shouldEmitData (reactor, fixture, length)
// #### @reactor {Reactor} Reactor to assert against
// #### @fixture {string} Test fixture to write data to
// #### @length {number} Expected number of events emitted
// Test macro for asserting that the number of events emitted
// by the `reactor` from the test `fixture` after the specified `timeout`.
//
exports.shouldEmitData = function (reactor, fixture, length, timeout, assertFn) {
  return {
    topic: function () {
      var source = new ReadWriteStream(),
          stream = reactor.createStream(source),
          that = this,
          all = [];

      stream.on('data', function (data) { all.push(data) });
      stream.on('end', function () {
        setTimeout(function () {
          that.callback(null, all)
        }, timeout);
      });
      helpers.writeFixture(source, fixture);
    },
    "should emit the appropriate events": function (err, all) {
      assert.isNull(err);
      assert.lengthOf(all, length);
      if (assertFn) {
        assertFn(all);
      }
    }
  };
};

//
// ### function shouldEmitDataSync (reactor, fixture, length)
// #### @reactor {Reactor} Reactor to assert against
// #### @fixture {string} Test fixture to write data to
// #### @length {number} Expected number of events emitted
// Test macro for asserting that the number of events emitted
// by the `reactor` from the test `fixture`.
//
exports.shouldEmitDataSync = function (reactor, fixture, length, assertFn) {
  return {
    topic: function () {
      var source = new ReadWriteStream(),
          stream = reactor.createStream(source),
          that = this,
          all = [];

      stream.on('data', function (data) { all.push(data) });
      stream.on('end', function () { that.callback(null, all) });
      helpers.writeFixture(source, fixture);
    },
    "should emit the appropriate events": function (err, all) {
      assert.isNull(err);
      assert.lengthOf(all, length);
      if (assertFn) {
        assertFn(all);
      }
    }
  };
};

//
// ### function shouldHaveMetric (reactor, fixture, value)
// #### @reactor {Reactor} Reactor to assert against
// #### @fixture {string} Test fixture to write data to
// #### @value {number} Expected value of the metric on the last event.
// Test macro for asserting that the value of the `metric` property of
// the last event emitted from the `reactor` is `value` using
// the test `fixture`.
//
exports.shouldHaveMetric = function (reactor, fixture, value, timeout) {
  return {
    topic: function () {
      var source = new ReadWriteStream(),
          stream = reactor.createStream(source),
          that = this,
          last;

      stream.on('data', function (data) { last = data });
      stream.on('end',  function () {
        setTimeout(function () {
          that.callback(null, last);
        }, timeout || 100);
      });

      helpers.writeFixture(source, fixture);
    },
    "should have the appropriate `metric`": function (err, last) {
      assert.isNull(err);
      assert.isObject(last)
      assert.equal(last.metric, value);
    }
  };
};

//
// ### function shouldHaveMetricSync (reactor, fixture, value)
// #### @reactor {Reactor} Reactor to assert against
// #### @fixture {string} Test fixture to write data to
// #### @value {number} Expected value of the metric on the last event.
// Test macro for asserting that the value of the `metric` property of
// the last event emitted from the `reactor` is `value` using
// the test `fixture`.
//
exports.shouldHaveMetricSync = function (reactor, fixture, value) {
  return {
    topic: function () {
      var source = new ReadWriteStream(),
          stream = reactor.createStream(source),
          that = this,
          last;

      stream.on('data', function (data) { last = data });
      stream.on('end',  function () { that.callback(null, last) });
      helpers.writeFixture(source, fixture);
    },
    "should have the appropriate `metric`": function (err, last) {
      assert.isNull(err);
      assert.isObject(last)
      assert.equal(last.metric, value);
    }
  };
};

//
// ### function shouldExpireSync (reactor, fixture, ttl)
// #### @reactor {Reactor} Reactor to assert against
// #### @fixture {string} Test fixture to write data to
// #### @ttl {number} Time to wait between events.
// Test macro for asserting that the specified `reactor` expires
// after the TTL limit.
//
exports.shouldExpireSync = function (reactor, fixture, ttl) {
  return {
    topic: function () {
      var that = this,
          source = new ReadWriteStream(),
          stream = reactor.createStream(source);

      stream.on('data', function (data) {
        if (!stream.readable) {
          return that.callback(new Error('Did not expire'));
        }

        that.callback(null, data);
        stream.end();
      });

      helpers.writeFixtureTtl(source, fixture, ttl);
    },
    "should get expired event": function (err, data) {
      assert.isNull(err);
      assert.isObject(data);
    }
  };
};

//
// ### function shouldNotExpireSync (reactor, fixture, ttl)
// #### @reactor {Reactor} Reactor to assert against
// #### @fixture {string} Test fixture to write data to
// #### @ttl {number} Time to wait between events.
// Test macro for asserting that the specified `reactor`
// does not expire.
//
exports.shouldNotExpireSync = function (reactor, fixture, ttl) {
  return {
    topic: function () {
      var that = this,
          source = new ReadWriteStream(),
          stream = reactor.createStream(source);

      stream.on('data', function (data) { that.callback(new Error('Did expire')) });
      stream.on('end',  function () { that.callback(null, stream) });
      helpers.writeFixtureTtl(source, fixture, ttl);
    },
    "should not expire": function (err, stream) {
      assert.isNull(err);
      assert.isObject(stream);
    }
  };
};

//
// ### function shouldErrorSync (reactor, fixture)
// #### @reactor {Reactor} Reactor to assert against
// #### @fixture {string} Test fixture to write data to
// Test macro for asserting that if a reactor errors, it is
// handled
//
exports.shouldErrorSync = function (reactor, fixture) {
  return {
    topic: function () {
      var that = this,
          source = new ReadWriteStream(),
          stream = reactor.createStream(source);

      stream.on('data', function (data) { that.callback(null, stream) });
      stream.on('error', function (err) { that.callback(err, null) });
      stream.on('end', function () { that.callback(null, stream) });
      helpers.writeFixture(source, fixture);
    },
    "should error": function (err, _) {
      assert.instanceOf(err, Error);
      assert.isNull(_);
    }
  };
};
