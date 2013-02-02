/*
 * json-parser.js: Dead-simple `g!\n!t` delimited JSON parser for the godot format.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    ReadWriteStream = require('./read-write-stream');

var delimiter = /g\!\n\!t$/;

//
// ### function JsonParser ()
// Constructor function for the JsonParser prototype responsible
// for parsing `g!\n!t` delimited JSON.
//
var JsonParser = module.exports = function JsonParser() {
  ReadWriteStream.call(this);
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
  var lines = data.split('g!\n!t'),
      self = this;
  
  //
  // If we have a fragment then concat the first
  // line because it completes it.
  //
  if (this.last) {
    this.last += lines.shift();
    lines = this.last.split('g!\n!t').concat(lines);
  }
  
  //
  // Grab the last data item because it is a partial
  //
  if (!delimiter.test(data)) {
    this.last = lines.pop();
  }
  
  //
  // If there are any lines attempt to parse
  // them as JSON.
  //
  if (lines.length) {
    lines.forEach(function (line) {
      if (!line) { return }
      var json;
      
      try { json = JSON.parse(line) }
      catch (ex) { return }
      
      self.emit('data', json);
    });
  }
};

