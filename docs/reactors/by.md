## By

Basic api usage

`.by(key|[key0, key1, key2..], reactor)`

The `by` reactor here is quite useful for splitting off the main reactor stream
into individual streams `by` a particular key on the `data`. This will be more
clear in the example.

```js

//
// Expire reactor set for 30 seconds to be used with the by reactor
//

var expire =
  reactor()
    .expire(1000 * 60)

//
// This will create a new independent reactor stream for each service sent
// through this reactor. Say we have multiple producers, each emitting
// a heartbeat every 15 seconds. With the by reactor, you will be able to
// independently assess if any of these producers hasn't responded and send an
// email for someone to check it out.
//

var by =
  reactor()
    .by(
      'service',
      expire
      .email({ to: 'user@host.com'})
    )
```
