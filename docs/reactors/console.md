## console

basic api usage

`.console()|.console(formatFn)`

This reactor is used as a simple data output to the console coming through a reactor pipe
stream. The custom FormatFn is useful when you want to trim the output to a one
liner (rather than `console.dir(data)` which is the default approach)

```js

var reactor = godot.reactor;

//
// So this is just a simpe example to log data to the console when `service = 'http/start'`
//

var console =
  reactor()
    .where('service', 'http/start')
    .console()


//
// And the same thing except the log is formatted for a single line with only
// certain keys
//

var consoleCustom =
  reactor()
    .where('service', 'http/start')
    .console(function (data) {
      console.log('host: ' + data.host + ' service: ' + data.service)
    })

```
