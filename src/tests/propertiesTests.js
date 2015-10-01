'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var properties = require('../properties.js');
var fromPrefixed = require('../properties.js').fromPrefixed;

describe('properties', () => {
  describe('fromPrefixed', () => {
    it('should convert position to fromPosition', () => {
      var res = fromPrefixed('position');
      expect(res).to.equal('fromPosition');
    });
  });

  describe('preprocessOptions', () => {
    it('should set delay through function initializers if delay is a function', () => {
      var config = {
        delay(i) {
          return i * 100;
        }
      };

      var options = properties.preprocessOptions(config, 3);
      expect(options.delay).to.equal(300);
    });

    it('should call allDone for last callback', () => {
      var config = {
        allDone() {}
      };

      sinon.stub(config, 'allDone');

      properties.preprocessOptions(config, 0, 1);
      properties.preprocessOptions(config, 1, 1);

      expect(config.allDone).to.have.been.calledOnce;
    });

    it('should set properties through function initializers', () => {
      var config = {
        position(i) {
          return [i, i, i];
        }
      };

      var firstProperties = properties.preprocessOptions(config, 0);
      var secondProperties = properties.preprocessOptions(config, 1);

      expect(firstProperties.position).to.eql([0, 0, 0]);
      expect(secondProperties.position).to.eql([1, 1, 1]);
    });
  });
});
