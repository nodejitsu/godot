/*
 * many-to-one.js: Performance test for many producers to one reactor
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var os = require('os'),
    async = require('utile').async,
    helpers = require('../helpers');

var port = helpers.nextPort;

async.series({
  reactor: async.apply(helpers.run, 'reactor', {
    type: 'tcp',
    port: port,
    processes: 1
  }),
  producers: async.apply(helpers.run, 'producer', {
    type: 'tcp',
    port: port,
    processes: (os.cpus().length * 2) - 1,
    produce: {
      host: "127.0.0.1",
      service: "godot/performance",
      state: "test",
      description: "Waiting to performance test Godot",
      tags: ["test", "perf"],
      metric: 1,
      ttl: 0
    }
  })
}, function (err, procs) {
  if (err) {
    console.log('Error starting test:')
    console.dir(err);
    process.exit(1);
  }

  setTimeout(function () {
    Object.keys(procs).forEach(function (type) {
      procs[type].forEach(function (child) {
        child.kill();
      });
    });
    
    process.exit();
  }, 10 * 1000);
})