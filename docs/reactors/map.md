## Map

Basic api usage

`.map(mapFn)`

This reactor is pretty straightforward. It allows you to do any type of mapping
events on the data before it is `emit`.

Here are a couple examples:

```js
//
// Query a registry to append more possible data to a value (async)
//

var mapAsync =
  reactor()
    .map(function (data, callback) {
      registry.get(data.host, function (err, info) {
        if (err) { return callback(err) }

        data.host + '/' + info;
        callback(null, data);
      })
    })

//
// Setting a tag on a data object being passed in
//

var map =
  reactor()
    .map(function (data) {
      data.tags.push('omgmap');
    })

```
