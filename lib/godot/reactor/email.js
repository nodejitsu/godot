/*
 * email.js: Stream responsible for sending emails on data events.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    SendGrid = require('sendgrid-web'),
    ReadWriteStream = require('../common/read-write-stream');

//
// ### function Email (options)
// #### @options {Object} Options for sending email.
// ####   @options.auth     {Object} Auth credentials for SendGrid.
// ####   @options.from     {string} Email address to send from.
// ####   @options.to       {string} Email address to send to.
// ####   @options.body     {string} Body of the email to send.
// ####   @options.subject  {string} Subject of the email to send.
// ####   @options.interval {number} Debounce interval when sending emails.
// ####   @options.client   {Object} Custom email client to use.
// Constructor function for the Email stream responsible for sending
// emails on data events.
//
var Email = module.exports = function Email(options) {
  if (!options || !options.from || !options.to
      || (!options.auth && !options.client)) {
    throw new Error('options.auth (or options.client), options.from, and options.to are required');
  }

  ReadWriteStream.call(this);

  this.auth     = options.auth;
  this.from     = options.from;
  this.to       = options.to;
  this.interval = options.interval;
  this._last    = 0;

  //
  // TODO: Support templating of these strings.
  //
  this.body    = options.body    || '';
  this.subject = options.subject || 'Godot error';
  this.client  = options.client  || new SendGrid(this.auth);
};

//
// Inherit from ReadWriteStream.
//
utile.inherits(Email, ReadWriteStream);

//
// ### function write (data)
// #### @data {Object} JSON to send email with
// Sends an email with the specified `data`.
//
Email.prototype.write = function (data) {
  var text = JSON.stringify(data, null, 2),
      self = this;

  //
  // Return immediately if we have sent an email
  // in a time period less than `this.interval`.
  //
  if (this.interval && this._last
      && ((new Date()) - this._last) <= this.interval) {
    return;
  }

  this.client.send({
    to:      this.to,
    from:    this.from,
    subject: this.subject,
    text:    this.body + '\n\n' + text
  }, function (err) {
    self._last = new Date();

    return err
      ? self.emit('error', err)
      : self.emit('data', data);
  });
};
