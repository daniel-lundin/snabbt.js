'use strict';

var expect = require('chai').expect;
var utils = require('../utils.js');
var props = require('../properties.js').tweenableProperties;
var fromPrefixed = require('../properties.js').fromPrefixed;

describe('utils', () => {

  describe('stateFromOptions', () => {
    it('should create new state with default values', () => {
      var res = utils.stateFromOptions({});

      Object.keys(props).forEach((prop) => {
        var defaultValue = props[prop][1];
        expect(res[prop]).to.eql(defaultValue);
      });
    });
  });
});

