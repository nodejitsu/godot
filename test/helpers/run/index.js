/*
 * index.js: Top-level include for starting test processes.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var fork = require('child_process').fork,
    path = require('path'),
    async = require('utile').async,
    range = require('r...e');

module.exports = function (type, options, callback) {
  var target = path.join(__dirname, type + '.js');
  
  async.map(
    range(1, options.processes).toArray(),
    function startOne(index, next) {
      console.log(['Starting', type, index].join(' '));
      var child = fork(target);
      
      child.on('message', function (msg) {
        return msg.error
          ? next(msg.error)
          : next(null, child);
      });
      child.send(options);
    },
    callback
  );
};