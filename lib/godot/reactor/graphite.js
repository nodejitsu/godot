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
 *         prefix: 'xxxx.gobot',
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
  this.prefix   = options.prefix;
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
  var text = JSON.stringify(data, null, 2),
      self = this;

  //
  // Return immediately if we have sent a matric
  // in a time period less than `this.interval`.
  //
  if (this.interval && this._last
      && ((new Date()) - this._last) <= this.interval) {
    return;
  }

  var metricname = utile.format("%s.%s.%s.%s", 
    this.prefix, 
    data.host.replace(/\./g, '_'), 
    data.service.replace(/\./g, '_').replace(/\//g, '.'),
    data.state
  );
  var metrics = {};
  metrics[metricname] = data.metric
  this.client.write(metrics, data.time, function (err) {
    self._last = new Date();

    return err
      ? self.emit('error', err)
      : self.emit('data', data);
  });
};
