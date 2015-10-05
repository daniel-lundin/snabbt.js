'use strict';

var sinon = require('sinon');
var expect = require('chai').expect;
var Engine = require('../engine.js');
var Animation = require('../animation.js');


describe.only('Engine', () => {

  describe('setAnimation', () => {
    it('should not tick if animation is stopped', () => {
      var animation = {
        isStopped() {
          return true;
        },
        tick: sinon.stub()
      };

      Engine.stepAnimation(animation, 100);

      sinon.assert.notCalled(animation.tick);
    });

    it('should call animation.tick and animation.updateElement', () => {
      var animation = {
        isStopped() {
          return false;
        },
        tick: sinon.stub(),
        updateElement: sinon.stub()
      };

      Engine.stepAnimation(animation, 100);

      sinon.assert.calledOnce(animation.tick);
      sinon.assert.calledOnce(animation.updateElement);
    });
  });

  describe('initializeAnimation', () => {

    beforeEach(() => {
      sinon.spy(Animation, 'createAnimation');
      Engine.runningAnimations = [];
    });

    afterEach(() => {
      Animation.createAnimation.restore();
    });

    it('should call createAnimation with states and options', () => {
      var element = {};
      var options = {
        fromPosition: [-1, -1, -1],
        position: [1, 1, 1]
      };

      Engine.initializeAnimation(element, options);

      sinon.assert.calledOnce(Animation.createAnimation);
    });

    it('should append to runningAnimations', () => {
      expect(Engine.runningAnimations.length).to.eql(0);

      var element = {};
      var options = {
        fromPosition: [-1, -1, -1],
        position: [1, 1, 1]
      };
      Engine.initializeAnimation(element, options);

      expect(Engine.runningAnimations.length).to.eql(1);
    });
  });
});
