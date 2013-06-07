## Window Sum

`.windowSum(window)`

So window sum is a simple reactor from [`window-stream`][window-stream] that
computes the sum of `data.metric` over a given `event-window` or `time-window`.

```js

var reactor = godot.reactor;

var windowStream = require('window-stream');

//
// So lets calculate how many logs came down the pipeline in one minute
// intervals.
//

var windowSum =
  reactor()
    .where('service', 'logs/stdout')
    .windowSum(
      new windowStream.TimeWindow({
        duration: 1000 * 60
      })
    )
```


[window-stream]: https://github.com/indexzero/window-stream


