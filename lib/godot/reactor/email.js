/*
 * email.js: Stream responsible for sending emails on data events.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    Sendgrid = require('sendgrid-web'),
    ReadWriteStream = require('../common/read-write-stream');

//
// ### function Email (options)
// #### @options {Object} Options for sending email.
// ####   @options.auth    {Object} Auth credentials for SendGrid.
// ####   @options.from    {string} Email address to send from.
// ####   @options.to      {string} Email address to send to.
// ####   @options.body    {string} Body of the email to send.
// ####   @options.subject {string} Subject of the email to send.
// Constructor function for the Email stream responsible for sending
// emails on data events.
//
var Email = module.exports = function Email(options) {
  if (!options || !options.auth || !options.from || !options.to) {
    throw new Error('options.auth, options.from, and options.to are required');
  }

  ReadWriteStream.call(this);

  this.auth    = options.auth;
  this.from    = options.from;
  this.to      = options.to;

  //
  // TODO: Support templating of these strings.
  //
  this.body    = options.body    || '';
  this.subject = options.subject || 'Godot error';

  //
  // TODO: Support more than SendGrid.
  //
  this.client = new SendGrid(this.auth);
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
  // TODO: Support debouncing in sending emails.
  //
  this.client.send({
    to:      this.to,
    from:    this.from,
    subject: this.subject,
    text:    this.body + '\n\n' + text
  }, function (err) {
    return err
      ? self.emit('error', err)
      : self.emit('data', data);
  });
};