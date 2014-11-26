/*
 * count.js: Stream responsible for writing messages to the console.
 *
 * (C) 2012, Charlie Robbins, Jarrett Cruger, and the Contributors.
 *
 */

var util = require('util'),
    common = require('../common'),
    ReadWriteStream = common.ReadWriteStream;

//
// ### function Console (formatFn)
// #### @formatFn {function} Formatting function to use on the data
// Constructor function of the Console stream responsible for writing
// messages to the console.
//
var Console = module.exports = function (formatFn) {
  if (!(this instanceof Console)) { return new Console(formatFn) }
  ReadWriteStream.call(this);

  this.formatFn = formatFn || console.dir;
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
  this.formatFn(data);
  this.emit('data', data);
};
