/*
 * any-meta.js: Stream for filtering events with any of a given meta key (or set of keys).
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var util = require('util'),
    HasMeta = require('./has-meta');

//
// ### function AnyMeta (keys|key0, key1, ..., keyN)
// #### @keys|key0..keyN {Array|arguments} Full set of keys to filter over.
// Constructor function of the AnyMeta stream responsible for filtering
// events with any of a given key (or set of keys).
//
var AnyMeta = module.exports = function () {
  HasMeta.apply(this, arguments);
  this.type = 'any';
};

//
// Inherit from HasMeta reactor.
//
util.inherits(AnyMeta, HasMeta);