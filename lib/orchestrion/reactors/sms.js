
var utile = require('utile'),
    os = require('os'),
    Telenode = require('telenode'),
    common = require('../csock/common'),
    apis = require('../../config/apis'),
    config = require('../../config/config'),
    constants = require('../../config/constants');

exports.meta = {
  debounceTime : 5 * 60 * 1000, // 5 minutes
  name         : 'sms',
  title        : 'SMS'
};

exports.inbound = function (data, options) {

  var that = this;
  var client = new Telenode(Telenode.providers.twilio);

  //
  // add the correct credentials.
  //
  client.credentials(apis.twilio.auth);

  //
  // send an sms message to a team.
  //
  client.SMS.send(
    {
      from: config.phone.source,

      //
      // TODO:
      // its possible that this should be more configurable.
      // possible that the metric should also
      //
      to: data.value,
      body: data.reason
    },
    function(err, data) {
      data = JSON.parse(data);

      if (err) {

        that.log('CRITICAL', 'An SMS alert failed to send', { data: data });

        //
        // Test Hook
        //
        that.debug && that.emit('plugins::alerts::failedSMS');
        return false;
      }

      //
      // make sure we get a response that includes the
      // sid that we sent in the original POST request.
      //
      that.log('CRITICAL', 'An SMS alert was sent', { data: data });

      //
      // Test Hook
      //
      that.debug && that.emit('plugins::alerts::successSMS');
    }
  );
};
