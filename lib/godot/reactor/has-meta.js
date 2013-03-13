/*
 * has-meta.js: Stream for filtering events with a given meta key (or set of keys).
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var util = require('util'),
    ReadWriteStream = require('../common/read-write-stream');

//
// ### function HasMeta ([type], keys|key0, key, ..., keyN)
// #### @type {any|all} Type of tag filtering to perform: any or all. 
// #### @keys|key0..keyN {Array|arguments} Full set of keys to filter over.
// Constructor function of the HasMeta stream responsible for filtering
// events with a given meta key (or set of keys).
//
var HasMeta = module.exports = function (type) {
  ReadWriteStream.call(this);
  
  var keys = Array.prototype.slice.call(arguments);
  
  if (type === 'any' || type === 'all') {
    this.type = type;
    keys.splice(0, 1);
  }
  else {
    this.type === 'any';
  }

  //
  // Create a lookup table of any values provided.
  // If no value is provided set the key to `null`
  // since we will be checking for `undefined`.
  //
  this.lookup = keys.reduce(function (all, key) {
    if (Array.isArray(key)) {
      key.forEach(function (kkey) {
        all[kkey] = null;
      });
    }
    else if (typeof key === 'object') {
      Object.keys(key).forEach(function (kkey) {
        all[kkey] = key[kkey];
      });
    }
    else {
      all[key] = null;
    }

    return all;
  }, {});
  
  //
  // Store the list of keys for iterating over later.
  //
  this.keys = Object.keys(this.lookup);
};

//
// Inherit from ReadWriteStream
//
util.inherits(HasMeta, ReadWriteStream);

//
// ### function write (data)
// #### @data {Object} JSON to rollup.
// Only filters `data` according to `this.keys`.
//
HasMeta.prototype.write = function (data) {
  var self = this;

  //
  // If there are no tags on the data return
  //
  if (!data.meta) {
    return;
  }
  
  //
  // Helper function for checking a given `key`.
  //
  function hasKey(key) {
    return data.meta[key] !== undefined
      && (self.lookup[key] === null ||
      self.lookup[key] === data.meta[key]);
  }
  
  var valid = this.type === 'all'
    ? this.keys.every(hasKey)
    : this.keys.some(hasKey);
    
  if (!valid) {
    return;
  }
  
  this.emit('data', data);
};