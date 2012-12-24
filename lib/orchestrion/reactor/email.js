var utile = require('utile'),
    Sendgrid = require('sendgrid-web'),
    Reactor = require('./reactor');
    
var Email = module.exports = function Email(options) {
  Reactor.call(this, options);
  
  this.options = options;
};

utile.inherits(Email, Reactor);

Email.prototype.write = function (data) {
  var sendgrid = new Sendgrid(apis.sendgrid),
      that = this,
      recip = data.value, // config.email.groups[options.group];
      from = config.email.source,
      to = recip.length > 1 ? recip : recip[0];

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