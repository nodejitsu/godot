/*
 * sms.js: Stream responsible for sending SMS messages on data events.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    Telenode = require('telenode'),
    ReadWriteStream = require('../common/read-write-stream');

//
// ### function Sms(options)
// #### @options {Object} Options for sending messages
// ####   @options.auth    {Object} Auth credentials for Twilio.
// ####   @options.from    {string} Phone number to send from.
// ####   @options.to      {string} Phone number to send to.
// ####   @options.body    {string} Body of the SMS to send.
// Constructor function for the Sms stream responsible for sending
// SMS messages on data events.
//
var Sms = module.exports = function Sms(options) {
  if (!options || !options.auth || !options.from || !options.to) {
    throw new Error('options.auth, options.from, and options.to are required');
  }

  ReadWriteStream.call(this);

  this.auth = options.auth;
  this.to   = options.to;

  //
  // TODO: Support templating of these strings.
  //
  this.body = options.body;

  //
  // TODO: Support more than Twilio.
  //
  this.client = new Telenode(telenode.providers.twilio);
  this.client.credentials(this.auth);
};

//
// Inherit from ReadWriteStream.
//
utile.inherits(Sms, ReadWriteStream);

//
// ### function write (data)
// #### @data {Object} JSON to send email with
// Sends an SMS with the specified `data`.
//
Sms.prototype.write = function (data) {
  var text = JSON.stringify(data),
      self = this;

  //
  // TODO: Support debouncing in sending SMS.
  //
  this.client.SMS.send({
    from: this.from,
    to:   this.to,
    body: this.body + ' ' + text
  }, function (err) {
    return err
      ? self.emit('error', err)
      : self.emit('data', data);
  });
};