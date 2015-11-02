'use strict';

const sinon = require('sinon');
const expect = require('chai').expect;
const Engine = require('../engine.js');
const Animation = require('../animation.js');
const createState = require('../state.js').createState;


describe('Engine', () => {

  describe('createAnimation', () => {
    const previousState = createState({ position: [1, 2, 3] });
    const element = {};

    beforeEach(() => {
      sinon.stub(Animation, 'createAnimation');
    });

    afterEach(() => {
      Animation.createAnimation.restore();

    });

    it('should use previous state as default for startState', () => {
      const options = { position: [4, 5, 6] };
      Engine.createAnimation(element, options, previousState);

      const startState = Animation.createAnimation.lastCall.args[0];
      const endState = Animation.createAnimation.lastCall.args[1];
      expect(startState.position).to.eql([1, 2, 3]);
      expect(endState.position).to.eql([4, 5, 6]);
    });

    it('should use previous state as default for endState', () => {
      const options = {};
      Engine.createAnimation(element, options, previousState);

      const startState = Animation.createAnimation.lastCall.args[0];
      const endState = Animation.createAnimation.lastCall.args[1];
      expect(startState.position).to.eql([1, 2, 3]);
      expect(endState.position).to.eql([1, 2, 3]);
    });
  });

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
      sinon.stub(Engine, 'scheduleNextFrame');
    });

    afterEach(() => {
      Engine.stepAnimation.restore();
      Engine.archiveCompletedAnimations.restore();
      Engine.scheduleNextFrame.restore();
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
        options: {},
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
        options: {},
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
        options: {},
        stop() {},
        completed() { return true; },
        endState() { return null; },
        getCurrentState() { return null; }
      };
      Engine.runningAnimations = [[{}, animation, chainer]];

      Engine.archiveCompletedAnimations();

      expect(Engine.runningAnimations.length).to.eql(1);
    });

    it('should not remove completed', () => {
      Engine.runningAnimations = [];
      Engine.completedAnimations = [[{}, {}, Engine.createChainer]];

      Engine.archiveCompletedAnimations();
      Engine.archiveCompletedAnimations();

      expect(Engine.completedAnimations.length).to.eql(1);
    });
  });

  describe('initializeAnimation', () => {

    beforeEach(() => {
      sinon.spy(Animation, 'createAnimation');
      sinon.stub(Engine, 'scheduleNextFrame');
      Engine.runningAnimations = [];
    });

    afterEach(() => {
      Animation.createAnimation.restore();
      Engine.scheduleNextFrame.restore();
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

    it('should use current state from running animations', () => {
      var previousState = createState({ position: [100, 100, 100] });
      var previousAnimation = {
        stop() {},
        getCurrentState() {
          return previousState;
        }
      };
      var element = {};
      Engine.runningAnimations = [[element, previousAnimation, {}]];

      var options = {
        position: [200, 200, 200]
      };
      Engine.initializeAnimation(element, options);

      var startState = Animation.createAnimation.lastCall.args[0];
      expect(startState.position).to.eql([100, 100, 100]);
    });

    describe('manual animations', () => {
      beforeEach(() => {
        sinon.stub(Animation, 'createAttentionAnimation');
      });

      afterEach(() => {
        Animation.createAttentionAnimation.restore();
      });

      it('should create attention animation', () => {
        var element = {};
        var options = {};
        Engine.initializeAnimation(element, 'attention', options);

        sinon.assert.calledOnce(Animation.createAttentionAnimation);
        sinon.assert.calledWith(Animation.createAttentionAnimation, options);
      });
    });
  });
});
