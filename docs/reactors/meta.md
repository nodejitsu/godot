## Meta

basic api usage

`.meta(key, reactor)`

So this reactor is pretty cool for assigning `data.meta[key]` to the
`data.metric` value of the `reactor` passed as the second argument. This will be
a little bit easier to see with an example...

```js

var windowStream = require('window-stream');

var reactor = godot.reactor;

//
// This particular example shows the meta reactor used to set the simple moving
// average over a 30 second interval to the `ma` meta property.
// the movingAverage reactor by default automatically sets the `variance` and
// `stdDev` to the meta as well.
//

var meta =
  reactor()
    .meta(
      'ma',
      reactor()
        .movingAverage({
          average: 'simple',
          window: new windowStream.TimeWindow({
            duration: 1000 * 30
          })
        })
    )

```
