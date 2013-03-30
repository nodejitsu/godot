/*
 * expire.js: Stream for filtering changes to properties on events.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var util = require('util'),
    ReadWriteStream = require('../common/read-write-stream');

//
// ### function Change (key, options)
// #### key {string} Key to detect wether or not its value changes
// #### Options {Object} **optional** Options for specified key
// ####   @from {string} Value you want to set as the base line
// ####   @to   {string}  Value you want to check if it changes to
// Constructor function of the Change stream responsible for filtering events
//
var Change = module.exports = function (key, options) {
  if (!key) {
    throw new Error('a key is required for this reactor');
  }
  ReadWriteStream.call(this);

  this.last;
  this.key = key;

  // Case where you want a specified change
  if (options) {
    this.from = options.from || null;
    this.to = options.to || null;
  }
};

//
// Inherit from ReadWriteStream
//
util.inherits(Change, ReadWriteStream);

//
// ### function write (data)
// #### @data {Object} JSON to filter
// Watches for changes to the `data` based on
// the `this.key` this instance is setup
// to monitor. if `this.from` exists as well as `this.to`,
// the change case is specified by those two parameters.
//
Change.prototype.write = function (data) {
  var self = this,
      changed = false;

  // If something changed, see if its a specified case or changed is true
  if (typeof this.last !== 'undefined'
      && data[this.key] !== this.last) {
    if (this.from && this.to) {
      if (this.last === this.from
          && data[this.key] === this.to) {
        changed = true;
      }
    }
    else {
      changed = true;
    }
  }
  this.last = data[this.key];
  if (changed) {
    this.emit('data', data);
  }
};
