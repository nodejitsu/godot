/*
 * all-meta.js: Stream for filtering events with a given meta key (or set of keys).
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var util = require('util'),
    HasMeta = require('./has-meta');

//
// ### function AllMeta (keys|key0, key1, ..., keyN)
// #### @keys|key0..keyN {Array|arguments} Full set of keys to filter over.
// Constructor function of the AllMeta stream responsible for filtering
// events with any of a given key (or set of keys).
//
var AllMeta = module.exports = function () {
  HasMeta.apply(this, arguments);
  this.type = 'all';
};

//
// Inherit from HasMeta reactor.
//
util.inherits(AllMeta, HasMeta);