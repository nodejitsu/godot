/*
 * json-parser.js: Dead-simple `g!\n!t` delimited JSON parser for the godot format.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    ReadWriteStream = require('./read-write-stream'),
    parted = require('parted');

//
// ### function JsonParser ()
// Constructor function for the JsonParser prototype responsible
// for parsing `g!\n!t` delimited JSON.
//
var JsonParser = module.exports = function JsonParser(options) {
  var options = options || {},
      self = this;

  ReadWriteStream.call(this);

  this._parser = parted.json.create(options);

  this._parser.on('error', function (err) {
    self.emit('error', err);
  });

  this._parser.on('output', function (data) {
    self.emit('data', data);
  });
};

//
// Inherit from ReadWriteStream.
//
utile.inherits(JsonParser, ReadWriteStream);

//
// ### function write (data)
// Attempts to parse the specified `data` and remembers
// fragments in the case of parser errors.
//
JsonParser.prototype.write = function (data) {
  return this._parser.write(data);
};

//
// ### function end (data)
//
JsonParser.prototype.end = function (data) {
  return this._parser.end(data);
};
