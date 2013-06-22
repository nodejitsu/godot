/*
 * where.js: Stream for filtering events based on properties.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var util = require('util'),
    ReadWriteStream = require('../common/read-write-stream');

//
// ### function Where ([filters|key], target)
// #### @filters {Object} **Optional** Full set of key:value pairs to filter for
// #### @key {string} Key to filter against
// #### @target {string} Value of `key` to filter against.
// Constructor function of the Where stream responsible for filtering events
// based on properties. `new Where(filters)` or `new Where(key, target)` are
// the two ways to instantiate this stream.
//
var Where = module.exports = function (filters, target, options) {
  ReadWriteStream.call(this);

  options = options || {};
  this.negate = options.negate || false;

  if (typeof filters === 'object') {
    this.filters = filters;
    this._setFilters(filters);
  }
  else {
    this.key = filters;
    this._setTarget(target);
  }
};

//
// Inherit from ReadWriteStream
//
util.inherits(Where, ReadWriteStream);

//
// ### function write (data)
// #### @data {Object} JSON to filter
// Filters the specified `data` against `this.key`
// and `this.value` OR `this.filters`.
//
Where.prototype.write = function (data) {
  var value;
  //
  // TODO: Make the negate logic more clear
  //
  if (this.key) {
    value = data[this.key];

    if ((this.match && this.match.test(value))
        || (this.isValid && this.isValid(value))
        || this.target === value) {
      this._action(data);
    }
    //
    // In regular case this is never called but in negate case we are flipping
    // the logic so we want to emit any events that do not match the filtering
    //
    else if(this.negate) {
      this.emit('data', data);
    }
  }
  else if (this.filters && this.filter(data)) {
    this._action(data);
  }
  else if (this.negate) {
    this.emit('data', data);
  }

};

//
// ### function filter (data)
// #### @data {Object} Event to match against filters.
// Returns a value indicating whether the specified `data`
// is valid against `this.filters`.
//
Where.prototype.filter = function (data) {
  var self = this;

  return this._filterKeys.every(function (key) {
    var filter = self._filters[key],
        value = data[key];

    return (filter.match && filter.match.test(value))
      || (filter.isValid && filter.isValid(value))
      || filter.target === value
        ? true
        : false;
  });
};

//
// ### @private function _action (data)
// #### @data {Object} data to emit or just ignore
// Returns an emit event or just returns if the this.negate
// is set. The negate allows the opposite behavior to take place.
Where.prototype._action = function (data) {
  if(this.negate) { return }

  return this.emit('data', data);
};

//
// ### @private function _setTarget (target, obj)
// #### @target {function|RegExp|string|number} Target to evaluate against a value
// #### @obj {Object} Context to set the target against.
// Sets the matching parameter on the `obj` context based on
// the `target`.
//
Where.prototype._setTarget = function (target, obj) {
  obj = obj || this;

  //
  // Allow strings to be converted to RegExps if `*`
  // is found.
  //
  if (typeof target === 'string' && ~target.indexOf('*')) {
    target = new RegExp(target.replace('*', '[^\\/]+'));
  }

  if (typeof target === 'function') {
    obj.isValid = target;
  }
  else if (target.test) {
    obj.match = target;
  }
  else {
    obj.target = target;
  }
};

//
// ### @private function _setFilters (filters)
// #### @filters {Object} Mapping of filters to keys
// Sets the set of matching parameters based on the specified
// `filters`.
//
Where.prototype._setFilters = function (filters) {
  var self = this;

  this._filterKeys = Object.keys(filters);
  this._filters = this._filterKeys
    .reduce(function (all, key) {
      all[key] = {};
      self._setTarget(filters[key], all[key]);
      return all;
    }, {});
};
