/*
 * net.js: Test helpers for working with `godot.net`.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var godot = require('../../lib/godot');

//
// ### function createServer (options, callback)
// Creates a `godot` client with the specified `options`.
//
exports.createClient = function (options, callback) {
  var client = godot.createClient({
    type: options.type,
    producers: options.producers
  });

  client.connect(options.port, options.host || 'localhost', function (err) {
    return err ? callback(err) : callback(null, client);
  });
};

//
// ### function createServer (options, callback)
// Creates a `godot` server with the specified `options`.
//
exports.createServer = function (options, callback) {
  var server = godot.createServer({
    type: options.type,
    reactors: options.reactors
  });

  server.listen(options.port, options.host || 'localhost', function (err) {
    return err ? callback(err) : callback(null, server);
  });
};

//
// ### function getStreams (obj, name)
// #### @obj {godot.net.Client|godot.net.Server} Object holding streams
// #### @names {string|Array} **Optional** Name(s) of streams to find
// Returns the set of instantiated streams on the `godot.net obj` filtering
// for names (if any).
//
exports.getStreams = function (obj, names) {
  if (typeof names === 'string') {
    names = [names];
  }

  if (obj.reactors) {
    //
    // TODO: Support more than one host
    //
    var key = Object.keys(obj.hosts)[0];

    return obj.hosts[key]
      .filter(function (stream) {
        return !names || ~names.indexOf(stream.name);
      });
  }
  else if (obj.producers) {
    //
    // TODO: Support producers
    //
  }
};

//
// ### function getStream (obj, name)
// #### @obj {godot.net.Client|godot.net.Server} Object holding streams
// #### @name {string} **Optional** Name(s) of streams to find
// Returns a single instantiated stream on the `godot.net obj` with the
// specified `name`.
//
exports.getStream = function (obj, name) {
  return exports.getStreams(obj, name)[0];
};
