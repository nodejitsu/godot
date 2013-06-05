## Rollup

So the basic API for a rollup reactor is as follows:

`.rollup(interval, limit)|.rollup(options)`

It rolls up a `limit` amount of events to emit every `interval`. `interval` can
also be a `function` that gives you the current `period` of the interval as well
as the `duration`.

Here are a couple possible use cases.

```js

var reactor = godot.reactor;

//
// Rolls up 10,0000 events every 5 minute interval
//
var rollup =
  reactor()
    .rollup(1000 * 60 * 5, 10000)

//
// Scaling Rollup, rolls up 10,000 events every 5min interval for 1 hour,
// then rolls up 10,000 events every 30mins
//

var scalingRollup =
  reactor()
    .rollup(function (period) {
      if(period < 12) {
        return 1000 * 60 * 5;
      }
      return 1000 * 60 * 30;
    }, 10000)
```
