'use strict';

const sinon = require('sinon');
const expect = require('chai').expect;
const Engine = require('../engine.js');
const Animation = require('../animation.js');
const createState = require('../state.js').createState;
const utils = require('../utils.js');


describe('Engine', () => {
  beforeEach(() => {
    const ultimateAncestor = {
      body: 'body'
    };
    sinon.stub(utils, 'findUltimateAncestor').returns(ultimateAncestor);
  });

  afterEach(() => utils.findUltimateAncestor.restore());

  describe('createAnimation', () => {
    const previousState = createState({ position: [1, 2, 3] });
    const element = { style: {} };

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
    it('should call animation.tick and animation.updateElement', () => {
      const animation = {
        isStopped() {
          return false;
        },
        tick: sinon.stub(),
        updateElement: sinon.stub()
      };
      const element = { style: {} };
      const time = 42;
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
      const animation = {
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
      const animation = {
        options: {},
        completed() {
          return true;
        }
      };
      const element = 'an element';

      Engine.runningAnimations = [[element, animation, Engine.createChainer()]];
      Engine.completedAnimations = [[element, animation, Engine.createChainer()]];
      Engine.completedAnimations = [[{}, animation, Engine.createChainer()]];

      Engine.archiveCompletedAnimations();

      expect(Engine.runningAnimations.length).to.eql(0);
      expect(Engine.completedAnimations.length).to.eql(2);
    });

    it('should start next queued animation', () => {
      const chainer = Engine.createChainer();
      chainer.snabbt({});

      const animation = {
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
      const element = { style: {} };
      const options = {
        fromPosition: [-1, -1, -1],
        position: [1, 1, 1]
      };

      Engine.initializeAnimation(element, options);

      sinon.assert.calledOnce(Animation.createAnimation);
    });

    it('should append to runningAnimations', () => {
      expect(Engine.runningAnimations.length).to.eql(0);

      const element = { style: {} };
      const options = {
        fromPosition: [-1, -1, -1],
        position: [1, 1, 1]
      };
      Engine.initializeAnimation(element, options);

      expect(Engine.runningAnimations.length).to.eql(1);
      expect(Engine.runningAnimations[0].length).to.eql(3);
    });

    it('should use current state from running animations', () => {
      const previousState = createState({ position: [100, 100, 100] });
      const previousAnimation = {
        stop() {},
        getCurrentState() {
          return previousState;
        }
      };
      const element = { style: {} };
      Engine.runningAnimations = [[element, previousAnimation, {}]];

      const options = {
        position: [200, 200, 200]
      };
      Engine.initializeAnimation(element, options);

      const startState = Animation.createAnimation.lastCall.args[0];
      expect(startState.position).to.eql([100, 100, 100]);
    });

    it('should cancel running animations on the same element', () => {
      const element = { style: {} };
      const animation = {
        stop() {},
        getCurrentState() {}
      }
      Engine.runningAnimations = [[element, animation, {}]];

      Engine.initializeAnimation(element, {});

      expect(Engine.runningAnimations).to.have.length(1);
    });

    it('should stop animation with \'stop\' command', () => {
      const element = { style: {} };
      Engine.completedAnimations = [];
      Engine.runningAnimations = [[element, {}, {}]];

      Engine.initializeAnimation(element, 'stop');

      expect(Engine.runningAnimations).to.have.length(0);
      expect(Engine.completedAnimations).to.have.length(1);
    });

    describe('attention animations', () => {
      beforeEach(() => {
        sinon.stub(Animation, 'createAttentionAnimation').returns({
          updateElement() {}
        });
      });

      afterEach(() => {
        Animation.createAttentionAnimation.restore();
      });

      it('should create attention animation', () => {
        const element = { style: {} };
        const options = {};
        Engine.initializeAnimation(element, 'attention', options);

        sinon.assert.calledOnce(Animation.createAttentionAnimation);
        sinon.assert.calledWith(Animation.createAttentionAnimation, options);
      });
    });
  });
});
