/*
 * irc.js: Stream responsible for sending irc message on data events.
 *
 * @obazoud
 *
 * Important: set mulitplex to false to create only one client
 *
 * Configuration sample:
 *
 *  godot.createServer({
 *    type: 'tcp',
 *    multiplex: false,
 *    reactors: [
 *      godot.reactor()
 *        .irc({
 *          host: 'irc.freenode.net',
 *          nick: 'godot', 
 *          channels: ['#godotirc']
 *          }
 *        })
 *    ]
 *  }).listen(1337);
 *
 *
 */

var utile           = require('utile'),
    ircb            = require('ircb'),
    ReadWriteStream = require('../common/read-write-stream');

//
// ### function Irc (options)
// #### @options {Object} Options for sending irc message.
// ####   @options.host      {string} The host to connect to.
// ####   @options.nick      {string} The nickname to attempt to use.
// ####   @options.channels  {Object} An array of channels to connect at startup
// ####   @options.formatter {Function} A function to format data
// 
// Constructor function for the Irc stream responsible for sending
// irc message on data events.
// 
//
var Irc = module.exports = function Irc(options) {
  if (!options || !options.host || !options.nick || !options.channels) {
    throw new Error('options.server, options.nick and options.channels are required');
  }

  ReadWriteStream.call(this);
  
  var self = this;
  this.options    = options;

  this.interval   = options.interval;
  this._last      = 0;
  this._joined = false;

  this.format  = options.formatter || this.formatter;

  this.client  = options.client || new ircb(this.options, function () {
    self._joined = false;
  });
  
  this.client.on('join', function(who, channel) {
    if (who.split('!')[0] === this.nick && self.options.channels.indexOf(channel) !== -1) {
      self._joined = true;
    }
  });
  this.client.on('kick', function (who, channel, trailing) {
    if (trailing.split('!')[0] === this.nick && self.options.channels.indexOf(channel) !== -1 ) {
      self._joined = false;
    }
  });

};

//
// Inherit from ReadWriteStream.
//
utile.inherits(Irc, ReadWriteStream);

//
// ### function write (data)
// #### @data {Object} JSON to send irc message
// Sends an irc message with the specified `data`.
//
Irc.prototype.write = function (data) {
  var text = JSON.stringify(data, null, 2),
      self = this;

  //
  // Return immediately if we have sent a message
  // in a time period less than `this.interval`.
  //
  if (this.interval && this._last
      && ((new Date()) - this._last) <= this.interval) {
    return;
  }

  self._last = new Date();
  if (this._joined) {
    this.client.say(this.options.channels, this.format(data));
  }

  return self.emit('data', data);
};

Irc.prototype.formatter = function (data) {
  var message = Object.keys(data).map(function(x) {
    return [x, data[x]].join(': ');
  }).join(', ');
  return message;
};