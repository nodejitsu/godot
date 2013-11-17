/*
 * graphite.js: Stream responsible for sending metrics on data events to graphite.
 *
 * @obazoud
 *
 * Important: set mulitplex to false to create only one Graphite client
 *
 * godot.createServer({
 *   type: 'tcp',
 *   multiplex: false,
 *   reactors: [
 *     godot.reactor()
 *       .graphite({
 *         url: 'plaintext://carbon.hostedgraphite.com:2003',
 *         prefix: 'xxxx.godot',
 *        })
 *       .console()
 *   ]
 * }).listen(1337);
 *
 */

var utile = require('utile'),
    graphite = require('graphite'),
    ReadWriteStream = require('../common/read-write-stream');

//
// ### function Graphite (options)
// #### @options {Object} Options for sending data to Graphite.
// ####   @options.url      {string} Graphite url.
// ####   @options.prefix   {string} Graphite prefix added to all metrics.
// Constructor function for the Graphite stream responsible for sending
// metrics on data events.
//
var Graphite = module.exports = function Graphite(options) {
  if (!options || !options.url || !options.prefix) {
    throw new Error('options.url and options.prefix are required');
  }

  ReadWriteStream.call(this);

  this.url      = options.url;
  this.prefix   = options.prefix   || 'godot';
  this.interval = options.interval || 60000;
  this.meta     = options.meta     || null;
  this._last    = 0;

  this.client  = options.client  || graphite.createClient(this.url);
};

//
// Inherit from ReadWriteStream.
//
utile.inherits(Graphite, ReadWriteStream);

//
// ### function write (data)
// #### @data {Object} JSON to send metric with
// Sends a metric with the specified `data`.
//
Graphite.prototype.write = function (data) {
  var self    = this,
      now     = new Date(),
      metrics = {},
      metricName;

  //
  // Return immediately if we have sent a metric
  // in a time period less than `this.interval`.
  //
  if (this.interval && this._last
      && (now - this._last) <= this.interval) {
    return;
  }

  metricName = utile.format("%s.%s.%s",
    this.prefix,
    data.host.replace(/\./g, '_'),
    data.service.replace(/\./g, '_').replace(/\//g, '.')
  );

  metrics[metricName] = this.meta ? data.meta[this.meta] : data.metric;
  this.client.write(metrics, data.time, function (err) {
    self._last = now;
    if (err) { return self.emit('reactor:error', err) }
  });

  self.emit('data', data);
};
