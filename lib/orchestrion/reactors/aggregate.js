/*
 * aggregate.js: Module that will aggregate Metrics and emit stats
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var constants = require('../../config/constants'),
    common = require('../csock/common');

exports.meta = {
  name: 'aggregate',
  title: 'Aggregate Metrics'
};

exports.outbound = function outbound() {

  var metrics = this.metrics;

  metrics.socket.on('metrics::available', function(data) {
    var aggregated = {};

    Object.keys(data).forEach(function(containerName) {

      var container = data[containerName];

      Object.keys(container).forEach(function(key) {

        var value = container[key];
        value = value.mean || value.precision;

        if (key.indexOf('-aggregate') < 0) {
          var aggregatedKey = key + '-aggregate';
          if (! aggregated[aggregatedKey]) {
            aggregated[aggregatedKey] = [];
          }
          aggregated[aggregatedKey].push(value);
        }
      });
    });

    //
    // Emit the aggregated means
    //

    Object.keys(aggregated).forEach(function(key) {
      var pop = aggregated[key].length;

      var sum = aggregated[key].reduce(function(sum, mean) {
        return sum + mean;
      }, 0);

      var average = sum / pop;
      var metric = {
        key: key,
        precision: average,
        average: false
      };

      metrics.observe(metric);

    });

  });

};

