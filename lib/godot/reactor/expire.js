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
// expired TTLs. **Defaults to 5-minute TTLs.**
//
var Expire = module.exports = function (ttl) {
  if (!(this instanceof Expire)) { return new Expire(ttl) }
  ReadWriteStream.call(this);

  this.ttl     = ttl || 1000 * 60 * 5;
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
  // Remarks:
  //   * Is this the behavior we want?
  //   * Should we override this.ttl with
  //     data.ttl?
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
