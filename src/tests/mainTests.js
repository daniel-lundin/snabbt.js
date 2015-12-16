'use strict';

var expect = require('chai').expect;
var snabbt = require('../main.js');
var sinon = require('sinon');
var Engine = require('../engine.js');


describe('main', () => {
  describe('initialization', () => {
    beforeEach(() => {
      sinon.stub(Engine, 'initializeAnimation');
    });

    afterEach(() => {
      Engine.initializeAnimation.restore();
    });

    it('should initialize one animation ', () => {
      var element = {};
      var options = {};
      snabbt(element, options);

      sinon.assert.calledOnce(Engine.initializeAnimation);
      sinon.assert.calledWith(Engine.initializeAnimation, element, options);
    });

    it('should create multiple animations if element is array-ish', () => {
      var elements = [{}, {}];
      var options = {};
      snabbt(elements, options);

      sinon.assert.calledTwice(Engine.initializeAnimation);
    });
  });

  describe('chaining', () => {
    beforeEach(() => {
      sinon.spy(Engine, 'initializeAnimation');
      sinon.stub(Engine, 'scheduleNextFrame');
      sinon.stub(Engine, 'createChainer');
    });

    afterEach(() => {
      Engine.initializeAnimation.restore();
      Engine.scheduleNextFrame.restore();
      Engine.createChainer.restore();
    });

    it('should multiplex chain operations', () => {
      var chainerStub = {
        snabbt: sinon.stub()
      };
      Engine.createChainer.returns(chainerStub);

      var elements = [{ style: {} }, { style: {} }];
      var options = {};
      snabbt(elements, options)
        .snabbt(options);

      sinon.assert.calledTwice(Engine.initializeAnimation);
      sinon.assert.calledTwice(chainerStub.snabbt);
    });

    it('should multiplex manual mode operations', () => {
      Engine.createChainer.returns({
        finish: (callback) => {
          callback();
        }
      });
      var elements = [{ style: {} }, { style: {} }];
      var options = {};

      var callback = sinon.stub();
      var chainer = snabbt(elements, options);
      chainer.finish(callback);

      sinon.assert.calledTwice(callback);
      expect(callback.firstCall.args).to.eql([0, 2]);
      expect(callback.secondCall.args).to.eql([1, 2]);
    });
  });
});
