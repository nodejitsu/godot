/*
 * expire.js: Stream for filtering expired TTLs.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var util = require('util'),
    ReadWriteStream = require('../common/read-write-stream');

//
// ### function Expire (ttl)
// #### @ttl {Number} Length of TTL to wait before expiring.
// Constructor function of the Expire stream responsible for filtering
// expired TTLs
//
var Expire = module.exports = function (ttl) {
  stream.Stream.call(this);

  this.ttl     = ttl;
  this.expired = false;

  this.resetTtl();
};

//
// Inherit from ReadWriteStream
//
util.inherits(Expire, ReadWriteStream);

//
// ### function write (data)
// #### @data {Object} JSON to check against TTL.
// Stores the last `data` received by this instance
// and resets the TTL timeout.
//
Expire.prototype.write = function (data) {
  //
  // Stop emitting data events after this instance
  // expires.
  //
  // Remark: Is this the behavior we want?
  //
  if (!this.expired) {
    this.last = data;
    this.resetTtl();
  }
};

//
// ### function resetTtl ()
// Resets the TTL timeout for this instance.
//
Expire.prototype.resetTtl = function () {
  var self = this;

  if (this.ttlId) {
    clearTimeout(this.ttlId);
  }

  this.ttlId = setTimeout(function () {
    clearTimeout(self.ttlId);
    self.expired = true;
    self.emit('data', self.last);
  }, this.ttl);
};