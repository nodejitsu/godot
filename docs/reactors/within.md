## Within

basic api usage

`.within(min, max)`

This a simple reactor that only emits an event when the `data.metric` falls
within the given inclusive range {min, max}.

```js

var reactor = godot.reactor;

//
// Emit the event when the metric is between a specified range
//

var within =
  reactor()
    .within(95, 100)
    .console()

```
