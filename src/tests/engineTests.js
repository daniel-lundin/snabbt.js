'use strict';

var sinon = require('sinon');
var expect = require('chai').expect;
var Engine = require('../engine.js');
var Animation = require('../animation.js');


describe('Engine', () => {

  describe('stepAnimation', () => {
    it('should not tick if animation is stopped', () => {
      var animation = {
        isStopped() {
          return true;
        },
        tick: sinon.stub()
      };
      var element = {};

      Engine.stepAnimation(element, animation, 100);

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
      var element = {};
      var time = 42;
      Engine.stepAnimation(element, animation, time);

      sinon.assert.calledOnce(animation.tick);
      sinon.assert.calledWith(animation.tick, time);
      sinon.assert.calledOnce(animation.updateElement);
    });
  });

  describe('stepAnimations', () => {
    beforeEach(() => {
      sinon.stub(Engine, 'stepAnimation');
      sinon.stub(Engine, 'archiveCompletedAnimations');
    });

    afterEach(() => {
      Engine.stepAnimation.restore();
      Engine.archiveCompletedAnimations.restore();
    });

    it('should call stepAnimation for each animation', () => {
      Engine.runningAnimations = [
        [{}, {}, {}],
        [{}, {}, {}]
      ];

      Engine.stepAnimations();

      sinon.assert.calledTwice(Engine.stepAnimation);
    });

    it('should call archiveAnimations', () => {
      Engine.stepAnimations();
      sinon.assert.calledOnce(Engine.archiveCompletedAnimations);
    });
  });

  describe('archiveCompletedAnimations', () => {
    it('should move finished animations from running to completed', () => {
      var animation = {
        completed() {
          return true;
        }
      };

      Engine.runningAnimations = [[{}, animation, Engine.createChainer()]];
      Engine.completedAnimations = [[{}, animation, Engine.createChainer()]];

      Engine.archiveCompletedAnimations();

      expect(Engine.runningAnimations.length).to.eql(0);
      expect(Engine.completedAnimations.length).to.eql(2);
    });

    it('should not save old finished animations on the same element', () => {
      var animation = {
        completed() {
          return true;
        }
      };
      var element = 'an element';

      Engine.runningAnimations = [[element, animation, Engine.createChainer()]];
      Engine.completedAnimations = [[element, animation, Engine.createChainer()]];
      Engine.completedAnimations = [[{}, animation, Engine.createChainer()]];

      Engine.archiveCompletedAnimations();

      expect(Engine.runningAnimations.length).to.eql(0);
      expect(Engine.completedAnimations.length).to.eql(2);
    });

    it('should start next queued animation', () => {
      var chainer = Engine.createChainer();
      chainer.snabbt({});

      var animation = {
        completed() {
          return true;
        }
      };
      Engine.runningAnimations = [[{}, animation, chainer]];

      Engine.archiveCompletedAnimations();

      expect(Engine.runningAnimations.length).to.eql(1);
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
      expect(Engine.runningAnimations[0].length).to.eql(3);
    });
  });
});
