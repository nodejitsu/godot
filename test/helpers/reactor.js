/*
 * reactor.js: Test helpers for working with reactors.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */
 
var async = require('utile').async,
    helpers = require('./index'),
    fixtures = helpers.fixtures;

//
// ### function writeFixture (stream, name)
// #### @stream {stream.Stream} Stream to write fixture data.
// #### @fixture {string|Array} Name of the fixture (or actual fixture) to write.
// Writes all data in the test fixture with the specified `name`
// to the `stream`.
//
exports.writeFixture = function (stream, fixture) {
  fixture = typeof fixture === 'string'
    ? fixtures[fixture]
    : fixture

  fixture.forEach(function (data) {
    stream.write(data);
  });

  stream.end();
};

//
// ### function writeFixtureTtl (stream, name, ttl)
// #### @stream {stream.Stream} Stream to write fixture data.
// #### @name {string} Name of the test fixture to write.
// #### @ttl {number} Length of the TTL between events.
// Writes all data in the test fixture with the specified `name`
// to the `stream`.
//
exports.writeFixtureTtl = function (stream, name, ttl) {
  async.forEachSeries(
    fixtures[name],
    function (data, next) {
      if (stream.writable) {
        stream.write(data);
        setTimeout(next, ttl);
      }
    },
    function () {
      stream.end();
    }
  );
};