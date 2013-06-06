## Over

basic api usage

`.over(ceiling)`

The `over` reactor emits an event when the `data.metric` exceeds the `ceiling`
value that you set.

```js

var reactor = godot.reactor;

//
// Log to the console when a server has over 90% cpu usage
//

var over =
  reactor()
    .where('service', 'server/cpu')
    .over(90)
    .console()


```
