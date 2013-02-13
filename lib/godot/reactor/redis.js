/*
 * redis.js Stream responsible for storing events in redis
 *
 * (C) 2013, Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    redis = require('redis'),
    ReadWriteStream = require('../common/read-write-stream');

//
// ### function Redis (options)
// #### @options {Object} Options for sending data to Redis
// ####   @options.host         {String} Host string for redis server
// ####   @options.port         {Number} Port for redis server
// ####   @options.password     {String} Password for redis server
// ####   @options.redisOptions {Object} To override any of the default options
// Constructor function for the Redis Stream responsible for adding events to
// redis
//
var Redis = module.exports = function Redis(options) {
  if (!options) {
    options = {};
  }

  ReadWriteStream.call(this);

  this.host = options.host || '127.0.0.1';
  this.port = options.port || 6379;
  this.password = options.password;
  this.client = options.client;
  this.redisOptions = options.redisOptions || {};

  // Check if client was passed in
  if(!this.client) {
    if (this.password) {
      this.client = redis.createClient(this.port, this.host, this.redisOptions);
      this.client.auth(this.password, function () {
        //Authenticated
      });
    }
    else {
      this.client = redis.createClient();
    }
  }

};

//
// Inherit from ReadWriteStream
//
utile.inherits(Redis, ReadWriteStream);

//
// ### function write (data)
// #### @data {Object} JSON to store in Redis
// Uses Redis to track active resources using a bitmap
//
Redis.prototype.write = function (data) {
  var self = this;

  this.client.SETBIT(data.service, data.metric, 1, function (err) {
    return err
      ? self.emit('error', err)
      : self.emit('data', data);
  });
};
