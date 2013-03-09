/*
 * by.js: Stream for creating a new set of streams based on a key change
 *
 * (C) 2013, Nodejitsu Inc.
 *
 */

var util = require('util'),
    ReadWriteStream = require('../common/read-write-stream'),
    Reactor = require('./reactor');

//
// ### function By (key, reactor)
// #### @key {string} Particular key to listen for a change
// #### @reactor {godot.reactor().type()} Reactor or reactor chain to be created
// Constructor function for the by stream to trigger the creation of a new set
// of streams based on a key change.
//
var By = module.exports = function (key, reactor) {
  ReadWriteStream.call(this);

  this.last;
  this.key = key;
  this.reactor = reactor;

};

//
// Inherit from ReadWriteStream
//
util.inherits(By, ReadWriteStream);

//
// ### function write (data)
// #### @data {Object} JSON to filter
// Watches for changes to the key value
// and pipes it to a new reactor or reactor chain
// if it does.
//
By.prototype.write = function (data) {
  var self = this;

  if (typeof this.last !== 'undefined'
      && this.last !== data[this.key]) {

    var reactor = new Reactor();
    var stream = reactor.createStream.call(this.reactor);
    this.pipe(stream);

    this.emit('data', data);
  }

  this.last = data[this.key];

};
