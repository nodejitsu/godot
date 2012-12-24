var orchestrion = require('../lib/orchestrion'),
    tools = require('orchestrion-tools');

//
// Reactor server which will email `charlie@nodejitsu.com`
// whenever any service matching /.*\/health\/heartbeat/
// fails to check in after 60 seconds.
//
orchestrion.createServer({
  reactors: [
    orchestrion.reactor()
      .where('service', '*/health/heartbeat')
      .expire(1000 * 60)
      .email({ to: 'charlie@nodejitsu.com' })
  ]
}).listen(1337);

//
// Producer client which sends events for the service
// `charlie/app-name/health/heartbeat` every 15 seconds.
//
orchestrion.createClient({
  producers: [
    tools.health.heartbeat('charlie/app-name')
      .ttl(1000 * 15)
  ]
}).open(1337);