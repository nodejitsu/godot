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
// ####   @options.auth     {Object} Auth credentials for Twilio.
// ####   @options.from     {string} Phone number to send from.
// ####   @options.to       {string} Phone number to send to.
// ####   @options.body     {string} Body of the SMS to send.
// ####   @options.interval {number} Debounce interval when sending SMSs.
// ####   @options.client   {Object} Custom SMS client to use.
// Constructor function for the Sms stream responsible for sending
// SMS messages on data events.
//
var Sms = module.exports = function Sms(options) {
  if (!options || !options.from || !options.to
      || (!options.auth && !options.client)) {
    throw new Error('options.auth (or options.client), options.from, and options.to are required');
  }

  ReadWriteStream.call(this);

  this.auth     = options.auth;
  this.to       = options.to;
  this.from     = options.from;
  this.interval = options.interval;
  this._last    = 0;

  //
  // TODO: Support templating of these strings.
  //
  this.body = options.body;

  if (!options.client) {
    this.client = new Telenode(telenode.providers.twilio);
    this.client.credentials(this.auth);
  }
  else {
    this.client = options.client;
  }
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
  // Return immediately if we have sent an email
  // in a time period less than `this.interval`.
  //
  if (this.interval && this._last
      && ((new Date()) - this._last) <= this.interval) {
    return;
  }

  this.client.SMS.send({
    from: this.from,
    to:   this.to,
    body: this.body + ' ' + text
  }, function (err) {
    self._last = new Date();

    return err
      ? self.emit('reactor:error', err)
      : self.emit('data', data);
  });
};
