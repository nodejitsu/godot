## Sum

basic api usage

`.sum()`

So this little reactor updates the `data.metric` property to be the sum of all
the `data.metric` properties that have through the pipe stream. Let me show an
example

```js

var reactor = godot.reactor;

//
// Sums the total # of requests over time (by checking for the `http/start` `service`)
// and output the # of requests to the console.
//

var sum =
  reactor()
    .where('service', 'http/start')
    .sum()
    .console(function (data) {
      console.log('Total Requests: ' + data.metric)
    })

```
