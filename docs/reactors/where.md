## Where

Basic api usage

`.where(key, value)|.where(filters)`

This reactor filters events based on a single `key:value` or a set of
`key:value` filters. The examples will make this clear.

```js

var reactor = godot.reactor;

//
// So in this example we are filtering based on the `*/health/heartbeat`
// `service` to only be dealing with heartbeats.
//

var where =
  reactor()
    .where('service', '*/health/heartbeat')

//
// And in this example we are filter that it is both a heartbeat and that the
// `state` is _error_
//

var filters =
  reactor()
    .where({
      'service': '*/health/heartbeat',
      'state': 'error'
    })


```
