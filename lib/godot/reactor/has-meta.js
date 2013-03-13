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

  this.keys = keys.reduce(function (all, key) {
    if (Array.isArray(key)) {
      all = all.concat(key);
    }
    else {
      all.push(key);
    }
    
    return all;
  }, []);
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
    return data.meta[key] !== undefined;
  }
  
  var valid = this.type === 'all'
    ? this.keys.every(hasKey)
    : this.keys.some(hasKey);
    
  if (!valid) {
    return;
  }
  
  this.emit('data', data);
};