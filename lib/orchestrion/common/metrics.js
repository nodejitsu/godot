
/*
 * metrics.js: Machinery for metrics processing.
 *
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    os = require('os'),
    fs = require('fs'),
    eventvat = require('eventvat'),

    rules = require('./rules'),
    avg = require('./avg'),
    common = require('./common'),
    criteria = require('./criteria'),
    constants = require('../../config/constants'),
    debounce = require('./debounce');

var containers = module.exports.containers = {};
var averages = {};
var data = {};

module.exports.availableMetrics = require('../../config/metrics');

//
// ### function Metrics(socket, options)
// #### @socket {Object} Continuation passing of the socket
// #### @options {Object} A configuration object
// ####    @interval {Number} Milliseconds at which metrics should be broadcast to the network
// ####    @autoexpire {Number} Milliseconds at which metrics should expire from the network
//
// The Metrics ctor. handles metrics processing, activates plugins, creates a quorum, etc.
//
var Metrics = exports.Metrics = function Metrics(socket, options) {

  var that = this;

  this.socket = socket; // used by processMetrics.
  this.autoexpire = options.autoexpire;

  //
  // if there is a sigint sent from the process to the metrics event emitter,
  // catch it and write the current metrics to the dump file, the actual `SIGINT`
  // event will exit the process.
  //
  this.on('sigint', function() {

    var dump = JSON.stringify(data, 2, 2);

    var fn = __dirname + '/../../logs/dump.json';

    fs.writeFile(fn, dump, function (err) {
      if (err) {
        throw new Error(err);
      }
      process.exit(0);
    });

  });

  setInterval(function () { // for the lifecycle of the entire process.

    data = {};

    //
    // add all the containers to a data object.
    //
    Object.keys(containers).forEach(function (id) {

      data[id] = containers[id].dump();
    });

    //
    // also add the local metrics.
    //
    data[socket.id] = that.dump();

    //
    // Test Hook.
    //
    socket.debug && socket.emit('metrics::cycle', data);

    //
    // broadcast the local metrics if the `metrics` rules permit it.
    //
    rules.validate.call(socket, that.hash, 'metrics', function (err, personas) {

      if (err) {
        common.log('SEVERE', 'could not validate metrics');
        return;
      }

      //
      // broadcast to all the known peers with the correct personas.
      //
      socket.broadcastToKnownPeers(data, personas, 'metrics');

    });

    //
    // process all of the current metics.
    //
    Object.keys(data).forEach(function (id) {
      Object.keys(data[id]).forEach(function (metric) {

        //
        // pass the metric name and the actual metric for processing.
        //
        data[id][metric] && that.process(metric, data[id][metric], socket.id);
      });
    });

    socket.emit('metrics::available', data);
    that.containers = containers;

  }, options.interval);

  eventvat.call(this, options);
};

utile.inherits(Metrics, eventvat);

//
// a method for consuming batches of metrics
//
Metrics.prototype.batch = function(data) {

  var autoexpire = this.autoexpire;

  //
  // Test Hook
  //
  this.socket.debug && this.socket.emit('metrics::batch', data);

  //
  // reconstitute the data into a working eventvat
  //
  Object.keys(data).forEach(function(id) {
    containers[id] = new eventvat({ data: data[id], autoexpire: autoexpire });
  });
};

//
// a method for propagating criteria.
//
Metrics.prototype.criteria = function(data, fn) {
  var that = this;

  common.log('INFO', 'validating new criteria');
  rules.validate.call(this.socket, containers[that.socket.id], 'criteria', function (err, persona) {
    if (err) {
      common.log('SEVERE', 'could not validate new criteria');
      return fn && fn(err);
    }

    common.log('INFO', 'new criteria validated');

    criteria.update(that.socket.appId, data, function(err, currentCriteria) {
      if (!err) {
        //
        // there was a modification to the criteria, we should attempt to communicate
        // the change to the appropriate peers in the network as well as write it to
        // disk.
        //
        common.log('INFO', 'broadcast new criteria to peers');
        that.socket.broadcastToKnownPeers(currentCriteria, persona, 'criteria');
      }

      // notify the caller
      fn && fn(err, currentCriteria);
    });
  });
};

//
// ### function observe(metric)
// #### @metric {Object} A configuration object
// ####    @key {String} The key that identifies the metric.
// ####    @precision {String} The precision for the metric.
// ####    @alpha {Number} (Optional) A specific precision for the alpha of the metric's average.
// ####    @interval {Number} (Optional) A specifical interval for the metric's average.
//
// observe a local metric.
//
Metrics.prototype.observe = function(metric) {

  var that = this;
  //
  // update and or create the associated averages instance.
  // the caller can specify that the averages for a metric
  // should not be tracked by specifying `metric.average`.
  //
  if (metric.average) {

    if (!averages[metric.key]) {

       averages[metric.key] = new avg.EWMA(

        metric.alpha || (1 - Math.exp(-5/60/15)),
        metric.interval || constants.TIME.MINUTE,
        typeof metric.average === 'string' ? metric.average : 'time'
      );
    }

    averages[metric.key].update(metric.precision);
  }

  var precision = metric.precision;

  //
  // determine the value that should be set for the metric.
  //
  if (!metric.precision) {

    if (this.hexists(metric.key, 'precision')) {
      precision = parseInt(this.hget(metric.key, 'precision')) + 1;
    }
    else {
      precision = 1;
    }
  }

  //
  // all metrics are stored as hash objects and get the
  // following key/value pairs. If the average is not expected
  // then it becomes extraneous and should not be added.
  //
  if (!metric.average) {

    this.hmset(
      metric.key,
      'precision',
      precision,
      'time',
      Date.now()
    );
  }
  else {

    this.hmset(
      metric.key,
      'mean',
      averages[metric.key] ? averages[metric.key].current.mean : 0,
      'variance',
      averages[metric.key] ? averages[metric.key].current.variance : 0,
      'precision',
      precision,
      'time',
      Date.now()
    );
  }

  //
  // arbitrary meta data that a metric may need to maintain.
  //
  if (metric.meta) {

    Object.keys(metric.meta).forEach(function (key) {
      that.hset(
        metric.key,
        key,
        metric.meta[key]
      );
    });
  }

  return this;
};

//
// ### function process()
//
// process a single metric.
//
Metrics.prototype.process = function (key, metric, instanceId) {

  //
  // Only instruments should act on metrics
  // ref: https://github.com/nodejitsu/orchestrion/issues/113
  //
  if (this.socket.persona === 'CONDUCTOR' || this.socket.persona === 'PRINCIPAL') {
    return false;
  }

  var that            = this,
      precision       = metric.precision,
      mean            = metric.mean,
      variance        = metric.variance;

  function callPlugins(threshold, boundaries, context) {
    var plugins = boundaries[threshold].plugins;

    plugins && Object.keys(plugins).forEach(function (name) {

      //
      // should pass some meaningful information to the plugin as
      // well as the desired information from the threshold setting.
      //
      context.value = plugins[name];

      if (that.socket.plugins && that.socket.plugins[name]) {

        context.meta = that.socket.plugins[name].meta;

        if (debounce(threshold, name, instanceId, context)) {
          that.socket.plugins[name].call(that.socket, context);
        }
      }

    });
  }


  criteria.get(this.socket.appId, function(err, currentCriteria) {
    if (currentCriteria[key]) {

      var boundaries = currentCriteria[key];

      //
      // check the precision, mean or variance against the
      // values in the defined thresholds in the `criteria.json`
      // document.
      //
      boundaries.upper = boundaries.upper || {};
      boundaries.lower = boundaries.lower || {};

      var context = {

        metric    : {
          name : key,
          data : metric
        },
        boundaries : boundaries,
        inbounds  : {
          upper : {
            precision : !(boundaries.upper.precision && precision >= boundaries.upper.precision),
            mean      : !(boundaries.upper.mean && mean >= boundaries.upper.mean),
            variance  : !(variance >= boundaries.upper.variance)
          },
          lower : {
            precision : !(boundaries.lower.precision && precision >= boundaries.lower.precision),
            mean      : !(boundaries.lower.mean && mean >= boundaries.lower.mean),
            variance  : !(variance >= boundaries.lower.variance)
          }
        }
      };

      // TODO: rip this out into another function
      var lower      = context.inbounds.lower,
          upper      = context.inbounds.upper,
          reason     = that.socket.appId + ' (' + key + ') is currently ';
          upperParts = [],
          lowerParts = [];


      Object.keys(upper).forEach(function(k) {
        if (!upper[k]) {
          upperParts.push(k + ' @ ' + metric[k] + '/' + boundaries.upper[k]);
        }
      });

      Object.keys(lower).forEach(function(k) {
        if (!lower[k]) {
          lowerParts.push(k + ' @ ' + metric[k] + '/' + boundaries.lower[k]);
        }
      });

      if (upperParts.length > 0) {
        context.reason = reason;
        context.reason += (upperParts.length > 1) ?
                  'above these thresholds: ' :
                  'above ';

        context.reason += upperParts.join('\n');
        boundaries.upper.plugins && callPlugins('upper', boundaries, context);
      }

      if (lowerParts.length > 0) {
        context.reason = reason;
        context.reason += (lowerParts.length > 1) ?
                  'below these thresholds: ' :
                  'below ';

        context.reason += lowerParts.join('\n');
        boundaries.lower.plugins && callPlugins('lower', boundaries, context);
      }
    }
  });
};
