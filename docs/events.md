# Godot : Events

Similar to [Riemann][riemann], events in Godot are simply JSON sent over UDP. Each event has these optional fields:

``` js
  {
    host:         "A hostname, e.g. 'api1', 'foo.com'"
    service:      "e.g. 'API port 8000 reqs/sec'",
    state:        "Any string less than 255 bytes, e.g. 'ok', 'warning', 'critical'",
    time:         "The time of the event, in unix epoch seconds",
    description:  "Freeform text",
    tags:         "Freeform list of strings, e.g. ['rate', 'fooproduct', 'transient']"
    metric:       "A number associated with this event, e.g. the number of reqs/sec."
    ttl:          "A floating-point time, in seconds, that this event is considered valid for. Expired states may be removed from the index."
  }
```