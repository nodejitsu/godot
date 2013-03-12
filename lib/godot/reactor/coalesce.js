/*
 * coalesce.js: Stream responsible for remembering and emitting vectors of events for `host/service` combinations.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var util = require('util'),
    common = require('../common'),
    ReadWriteStream = common.ReadWriteStream;

//
// ### function Coalesce (formatFn)
// Constructor function of the Coalesce stream responsible for remembering
// and emitting vectors of events for `host/service` combinations.
//
var Coalesce = module.exports = function (formatFn) {
  ReadWriteStream.call(this);
  
  this.keys   = {};
  this.events = [];
};

//
// Inherit from ReadWriteStream
//
util.inherits(Coalesce, ReadWriteStream);

//
// ### function write (data)
// #### @data {Object} JSON to output
// Attempts to set the event for the `data.host` and
// `data.service` combination and pushes it to `this.events`.
// If it already exists, replaces it in `this.events` before
// emitting data.
//
Coalesce.prototype.write = function (data) {
  var key = data.host + '/' + data.service;
  
  if (this.keys[key]) {
    this.events.splice(
      this.events.indexOf(this.keys[key]),
      1,
      data
    );
  }
  else {
    this.events.push(data);
  }

  this.keys[key] = data;
  this.emit('data', this.events.slice());
};