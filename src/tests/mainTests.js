'use strict';

var expect = require('chai').expect;
var snabbt = require('../main.js').snabbt;
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
    var chainerStub;

    beforeEach(() => {
      chainerStub = {
        snabbt: sinon.stub()
      };
      sinon.spy(Engine, 'initializeAnimation');
      sinon.stub(Engine, 'scheduleNextFrame');
      sinon.stub(Engine, 'createChainer').returns(chainerStub);
    });

    afterEach(() => {
      Engine.initializeAnimation.restore();
      Engine.scheduleNextFrame.restore();
      Engine.createChainer.restore();
    });

    it('should multiplex chain operations', () => {
      var elements = [{}, {}];
      var options = {};
      snabbt(elements, options)
        .snabbt(options);

      sinon.assert.calledTwice(Engine.initializeAnimation);
      sinon.assert.calledTwice(chainerStub.snabbt);
    });
  });

});
