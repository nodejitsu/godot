/*
 * count.js: Stream responsible for writing messages to the console.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var util = require('util'),
    common = require('../common'),
    ReadWriteStream = common.ReadWriteStream;

//
// ### function Console ()
// Constructor function of the Console stream responsible for writing
// messages to the console.
//
var Console = module.exports = function () {
  ReadWriteStream.call(this);
};

//
// Inherit from ReadWriteStream
//
util.inherits(Console, ReadWriteStream);

//
// ### function write (data)
// #### @data {Object} JSON to output
// Write `data` to console.
//
Console.prototype.write = function (data) {
  console.dir(data);
  return true;
};