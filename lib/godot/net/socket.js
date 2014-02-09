
var Transform = require('readable-stream').Transform,
    util = require('util'),
    clone = require('../common').clone;

var extend = util._extend;

//
// Pseudo "Socket" like thing to ensure we have a new copy of
// each data event that is written to this. This is passed into the constructor
// of the `reactor`
//
var Socket = module.exports = function (options) {
  if (!(this instanceof Socket)) return new Socket(options);
  Transform.call(this, extend({ objectMode: true }, options));
};

util.inherits(Socket, Transform);

Socket.prototype._transform = function (chunk, encoding, callback) {
  this.push(clone(chunk));
  if (callback) callback();
};

