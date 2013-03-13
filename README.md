# godot

Godot is a streaming real-time event processor based on [Riemann][riemann] written in Node.js

* [Usage](#usage)
* [Events](#events)
* [Reactors](#reactors)
  * [Primatives](#primatives)
* [Producers](#producers)
* [Tests](#test)

## Usage

Here is a simple example of a [Reactor](#reactors) server that will send an email to `user@host.com` if the [Producer](#producer) server for `app.server` fails to send a heartbeat after 60 seconds.

``` js
  var godot = require('../lib/godot');

  //
  // Reactor server which will email `user@host.com`
  // whenever any service matching /.*\/health\/heartbeat/
  // fails to check in after 60 seconds.
  //
  godot.createServer({
    //
    // Defaults to UDP
    //
    type: 'udp',
    reactors: [
      godot.reactor()
        .where('service', '*/health/heartbeat')
        .expire(1000 * 60)
        .email({ to: 'user@host.com' })
    ]
  }).listen(1337);

  //
  // Producer client which sends events for the service
  // `app.server/health/heartbeat` every 15 seconds.
  //
  godot.createClient({
    //
    // Defaults to UDP
    //
    type: 'udp',
    producers: [
      godot.producer({
        host: 'app.server.com',
        service: 'app.server/health/heartbeat',
        ttl: 1000 * 15
      })
    ]
  }).connect(1337);
```

## Events
Similar to [Riemann][riemann], events in `godot` are simply JSON sent over UDP or TCP. Each event has these optional fields:

``` js
  {
    host:         "A hostname, e.g. 'api1', 'foo.com'"
    service:      "e.g. 'API port 8000 reqs/sec'",
    state:        "Any string less than 255 bytes, e.g. 'ok', 'warning', 'critical'",
    time:         "The time of the event, in unix epoch seconds",
    description:  "Freeform text",
    tags:         "Freeform list of strings, e.g. ['rate', 'fooproduct', 'transient']",
    meta:         "Freeform set of key:value pairs e.g. { 'ewma': 12345 }",
    metric:       "A number associated with this event, e.g. the number of reqs/sec.",
    ttl:          "A floating-point time, in seconds, that this event is considered valid for."
  }
```

## Reactors
Reactors in Godot are **readable and writable** [Stream][stream] instances which consume [Events](#events) and produce actions or aggregate data flow.

### Primatives

There are several core Reactor primatives available in `godot` which can be composed to create more complex behavior:

* `.aggregate()`: Aggregates `metric` property on events
* `.change(key0, key1, ...)`: Emits events in which **any** of `key0 ... keyN` have changed.
* `.email(options)`: Sends an email to the specified [options][email-options].
* `.expire(ttl)`: Emits an event when no data is received after `ttl` milliseconds.
* `.forward(options)`: Forwards all events to a remote server located at `options.host` and `options.port`.
* `.sms(options)`: Sends an sms to the specified [options][sms-options].
* `.where(key, value)|.where(filters)`: Filters events based on a single `key:value` pair or a set of `key:value` filters.

## Producers
Producers in Godot are **readable** [Stream][stream] instances which produce [Events](#events). Events will be emitted by a given Producer every `ttl` milliseconds.

## Tests

All tests are written in [vows][vows] and can be run with [npm][npm]:

```
  npm test
```

#### Copyright (C) 2012. Nodejitsu Inc.

[riemann]: http://aphyr.github.com/riemann/
[stream]: http://nodejs.org/api/stream.html
[email-options]: https://github.com/nodejitsu/godot/tree/master/lib/godot/reactor/email.js
[sms-options]: https://github.com/nodejitsu/godot/blob/master/lib/godot/reactor/sms.js
[npm]: https://npmjs.org
[vows]: http://vowsjs.org/
