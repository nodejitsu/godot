/*
 * tagged-all.js: Stream for filtering events with all of a given tag (or set of tags).
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var util = require('util'),
    Tagged = require('./tagged');

//
// ### function TaggedAny (tags|tag0, tag1, ..., tagN)
// #### @tags|tag0..tagN {Array|arguments} Full set of tags to filter over.
// Constructor function of the TaggedAny stream responsible for filtering
// events with all of a given tag (or set of tags).
//
var TaggedAll = module.exports = function () {
  Tagged.apply(this, arguments);
  this.type = 'all';
};

//
// Inherit from Tagged reactor.
//
util.inherits(TaggedAll, Tagged);