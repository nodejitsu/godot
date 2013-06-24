## Moving Average

basic api usage

`.movingAverage({average: 'type', duration: 'time (in ms)'|size: 'event #')`

This little reactor is quite useful and is part of a separate module called
[`window-stream`][window-stream]. It allows you to perform a [moving average][moving-average]
of various [`types`](#types) over a specific `event-window` or `time-window`.
The api you see above establishes an implicit `event-window` if you give it
`size` or a `time-window` if you give it `duration`.

<a href="#types"></a>
### Types
* Simple
* Weighted
* Exponential

```js

var reactor = godot.reactor;

var windowStream = require('window-stream');

//
// So here lets just calculate the moving average over a set `time-window`
// of all our incoming requests and send those numbers off to graphite
// because who doesn't like pretty graphs? This example will give us a nice
// graph showing our average requests per minute over time.
//

var graphMovingAverage =
  reactor()
    .where('service', 'http/start')
    .movingAverage({
      average: 'simple',
      duration: 1000 * 60
    })
    .graphite({
      url: 'plaintext://graphiteUrl.com',
      prefix: 'requests.ma'
    })

```

[window-stream]: https://github.com/indexzero/window-stream
[moving-average]: https://en.wikipedia.org/wiki/Moving_average
