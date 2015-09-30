'use strict';

var expect = require('chai').expect;
var utils = require('../utils.js');

describe('utils', () => {

  describe('stateFromOptions', () => {
    it('should create new state object', () => {
      var res = utils.stateFromOptions({
        position: [1, 2, 3]
      });

      expect(res.position).to.eql([1, 2, 3]);
    });
  });
});

