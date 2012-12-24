/*
 * net.js: Top-level include for the `net` module responsible for creating TCP and UDP servers / clients.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

exports.tcp    = require('./tcp');
exports.udp    = require('./udp');
exports.Server = require('./server');
exports.Client = require('./client');