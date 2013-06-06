## expire

basic api usage

`.expire(ttl)`

This reactor emits an event when no data is received after `ttl` milliseconds.
Useful for heartbeat scenarios as shown in the `by` reactor example.

```js

var reactor = godot.reactor;

//
// expire if it doesn't receive an event after 30 seconds
//

var expire =
  reactor()
    .expire(1000 * 30)

```
