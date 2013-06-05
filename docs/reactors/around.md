## around

Basic api usage

`.around(reactor0, reactor1, ...)`

So this reactor is useful if you want to send the same stream of `data` to their
own independent reactor streams. See below

```js

var reactor = godot.reactor;

//
// in this example we create an around reactor that creates a new stream
// for the reactors when sending both sms and emails. This is meant to show that
// you can do multiple things based on the single stream.
//

var around =
  reactor()
    .around(
      reactor()
        .email({
          to: 'user@host.com',
          from: 'errors@host.com',
          auth: {
            user: 'user@host.com',
            key: 'xxxxxxxxxxxxxxxx'
          }
        }),
      reactor()
        .sms({
          to: '9141234567',
          from: '1337910856',
          auth: {
            sid: 'yyxxxxxxxxxxxxx',
            authToken: 'xxxxxxxxxxxxxxxx'
          }
        })
    )

```
