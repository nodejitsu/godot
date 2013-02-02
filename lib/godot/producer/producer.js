/*
 * producer.js: Producer object responsible for creating events to process.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var stream = require('stream'),
    utile = require('utile'),
    uuid = require('node-uuid');

//
// ### function Producer (options)
// #### @options {Object} Options for this producer.
// Constructor function for the Producer object responsible
// for creating events to process.
//
var Producer = module.exports = function Producer(options) {
  options = options || {};
  stream.Stream.call(this);

  var self = this;

  //
  // TODO: Use the default host for the running process.
  //
  this.id       = uuid.v4();
  this.readable = true;
  this.values   = {};

  //
  // Set the defaults for this instance.
  //
  Object.keys(this.types)
    .filter(function (key) {
      return key !== 'ttl';
    })
    .forEach(function (key) {
      self[key](options[key] || self.defaults[key]);
    });

  //
  // Set the TTL
  //
  this.ttl(typeof options.ttl === 'number'
    ? options.ttl
    : this.defaults.ttl);
};

//
// Inherit from stream.Stream.
//
utile.inherits(Producer, stream.Stream);

//
// ### @defaults {Object}
// Default values for properties on events
// emitted by this instance.
//
Producer.prototype.defaults = {
  state:       'ok',
  description: 'No description',
  tags:        [],
  metric:      1,
  ttl:         15000
};

//
// ### @types {Object}
// Types for properties on events emitted by
// this instance.
//
Producer.prototype.types = {
  host:        'string',
  service:     'string',
  state:       'string',
  description: 'string',
  time:        'number',
  tags:        'array',
  metric:      'number',
  ttl:         'number'
};

//
// ### function host|service|state|description|tags|metric (value)
// #### @value {string|number} Value to set for the specified key.
// Sets the specified `key` on data produced by this instance.
//
Object.keys(Producer.prototype.types).forEach(function (key) {
  Producer.prototype[key] = function (value) {
    var type      = Producer.prototype.types[key],
        valueType = typeof value,
        self      = this;

    //
    // Only set the key on this instance if the typeof `value`
    // matches expected type. Allow for undefined values.
    //
    if ((type === 'array' && Array.isArray(value))
        || type === valueType
        || valueType === 'undefined') {
      if (key === 'ttl' && typeof value === 'number' && value !== this.values.ttl) {
        //
        // If the ttl is set to zero then pummell emit data
        //
        if (value === 0) {
          return (function tickProduce() {
            process.nextTick(function () {
              self.produce();
              tickProduce();
            });
          })();
        }

        //
        // Only set the TTL if it has a real value that is
        // different from the current TTL.
        //
        if (this.ttlId) {
          clearInterval(this.ttlId);
        }

        this.ttlId = setInterval(function () {
          self.produce();
        }, value);
      }

      this.values[key] = value;
      return this;
    }

    //
    // Throw an error if there is a type mismatch.
    //
    throw new Error('Type mismatch: ' + key + ' must be a ' + type);
  };
});

//
// ### function produce ()
// Emits the data for this instance
//
Producer.prototype.produce = function () {
  this.emit('data', {
    host:        this.values.host,
    service:     this.values.service,
    state:       this.values.state,
    time:        Date.now(),
    description: this.values.description,
    tags:        this.values.tags,
    metric:      this.values.metric,
    ttl:         this.values.ttl
  });
};
