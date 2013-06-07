## Redis

basic api usage

`.redis(options, redisFn)`

So this reactor is a simple wrapper around [node-redis][redis] that gives you
the redis `client`, the `data` and a `callback` for handling errors.

```js

var reactor = godot.reactor;

//
// Use a redis client to store any piece of the `data` that seems relevant to you.
//

var redis =
  reactor()
    .redis({
      host: '127.0.0.1',
      port: 6379
    }, function(client, data, callback) {
      client.setbit(data.host, data.metric, callback);
    })

```


[redis]: https://github.com/mranney/node_redis
