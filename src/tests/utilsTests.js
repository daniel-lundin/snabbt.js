'use strict';

var expect = require('chai').expect;
var utils = require('../utils.js');

describe('utils', () => {
  describe('isFunction', () => {
    it('should return true for function', () => {
      var fun = () => {};
      expect(utils.isFunction(fun)).to.be.ok;
    });

    it('should return false for non-function', () => {
      var fun = '[Function]';
      expect(utils.isFunction(fun)).to.not.be.ok;
    });
  });

  describe('updateElementTransform', () => {
    var matrix;
    beforeEach(() => {
      matrix = {
        asCSS() {
          return 'matrix-as-css';
        }
      };
    });

    it('should add perspective before matrix if defined', () => {
      var element = { style: {} };
      var perspective = 500;
      var transformProperty = 'transform';
      utils.updateElementTransform(element, matrix, transformProperty, perspective);

      expect(element.style[transformProperty]).to.equal('perspective(' + perspective + 'px) matrix-as-css');
    });
  });
});
