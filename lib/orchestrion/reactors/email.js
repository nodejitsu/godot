var utile = require('utile'),
    os = require('os'),
    Sendgrid = require('sendgrid-web'),
    common = require('../csock/common'),
    apis = require('../../config/apis');
    config = require('../../config/config'),
    constants = require('../../config/constants');

exports.meta = {
  debounceTime : 5 * 60 * 1000, // 5 minutes
  name         : 'email',
  title        : 'Email'
};

exports.inbound = function inbound(data, options) {
  var sendgrid = new Sendgrid(apis.sendgrid);
  var that = this;
  var recip = data.value;//config.email.groups[options.group];
  var from = config.email.source;
  var to = recip.length > 1 ? recip : recip[0];

  sendgrid.send({
    to: to,
    from: from,
    subject: data.reason,
    text: data.reason
  }, function (err) {
    if (err) {

      that.log(
        'CRITICAL',
        'Failed to send email',
        { pid: data }
      );

      //
      // Test Hook
      //
      that.debug && that.emit('plugins::alerts::failedEmail');

    } else {

      that.log(
        'CRITICAL',
        'Successfully sent email',
        { pid: data }
      );

      //
      // Test Hook
      //
      that.debug && that.emit('plugins::alerts::successEmail');

    }
  });
};
