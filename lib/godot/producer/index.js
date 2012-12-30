/*
 * index.js: Top-level include for the `producers` module responsible creating events to process.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var utile = require('utile');

//
// ### function producer (options)
// #### @options {Object} Options to use when instantiating this producer
// Creates a new producer for emitting events to process.
//
var producer = module.exports = function (options) {
  return new producer.Producer(options);
};

//
// ### @Producer {Object}
// Base Prototype for the Producer.
//
producer.Producer = require('./producer');