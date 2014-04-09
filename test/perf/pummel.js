/*
 * pummel.js: Performance test pummeling a single reactor.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var os = require('os'),
    async = require('utile').async,
    helpers = require('../helpers');

var optimist = require('optimist')
  .usage('Pummel performance tests for a single reactor')
  .option('port', {
    description: 'port to run test on',
    alias: 'p',
    number: true,
    default: helpers.nextPort
  })
  .option('over', {
    description: 'network protocol to use',
    alias: 'o',
    string: true,
    default: 'tcp'
  })
  .option('concurrency', {
    description: 'number of reactors to create',
    alias: 'c',
    number: true,
    default: os.cpus().length - 1
  })
  .option('interval', {
    description: 'sampling interval',
    alias: 'i',
    number: true,
    default: 10
  })
  .option('duration', {
    description: 'duration of the test',
    alias: 'd',
    number: true,
    default: 10
  })
  .option('multiplex', {
    description: 'does server multiplex',
    alias: 'm',
    boolean: true,
    default: false
  })
  .option('ttl', {
    description: 'ttl duration of messages',
    number: true,
    default: 0
  });

argv = optimist.argv;

if (argv.help || argv.h) {
  return optimist.showHelp();
}

console.log([
  'Starting performance test with:',
  '  network protocol  ' + argv.over,
  '  concurrency:      ' + argv.c,
  '  sampling interval ' + argv.i + 's',
  '  duration:         ' + argv.d + 's',
  '  ttl:              ' + argv.ttl,
  '  port:             ' + argv.port,
  ''
].join('\n'));

async.series({
  reactor: async.apply(helpers.run, 'reactor', {
    type: argv.over,
    port: argv.port,
    duration: argv.interval,
    multiplex: argv.multiplex,
    processes: 1
  }),
  producers: async.apply(helpers.run, 'producer', {
    type: argv.over,
    port: argv.port,
    processes: argv.concurrency,
    produce: {
      host: "127.0.0.1",
      service: "godot/performance",
      state: "test",
      description: "Waiting to performance test Godot",
      tags: ["test", "perf"],
      metric: 1,
      ttl: argv.ttl
    }
  })
}, function (err, procs) {
  if (err) {
    console.log('Error starting test:')
    console.dir(err);
    process.exit(1);
  }

  console.log('\nNow receiving messages...');

  setTimeout(function () {
    Object.keys(procs).forEach(function (type) {
      procs[type].forEach(function (child) {
        child.kill();
      });
    });

    console.log();
    process.exit();
  }, (argv.duration + 1) * 1000);
})
