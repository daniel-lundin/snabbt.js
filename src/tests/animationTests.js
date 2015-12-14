'use strict';

const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-string'));
const createAnimation = require('../animation.js').createAnimation;
const createState = require('../state.js').createState;


describe('animations', () => {

  describe('tick', () => {
    let animation;
    let startedCallback;
    let updateCallback;
    const startState = createState({});
    const endState = createState({});

    beforeEach(() => {
      startedCallback = sinon.stub();
      updateCallback = sinon.stub();
      animation = createAnimation(startState, endState, {
        start: startedCallback,
        update: updateCallback
      });
      sinon.stub(animation, 'updateCurrentTransform');
    });

    afterEach(() => {
      animation.updateCurrentTransform.restore();
    });

    it('should call updateTransform for first tick', () => {
      sinon.assert.notCalled(animation.updateCurrentTransform);

      animation.tick(100);
      sinon.assert.calledOnce(animation.updateCurrentTransform);
    });

    it('should call started callback for first tick', () => {

      animation.tick(1);
      animation.tick(2);

      sinon.assert.calledOnce(startedCallback);
    });

    it('should call update callback for every tick', () => {

      animation.tick(0);
      animation.tick(250);
      animation.tick(500);

      sinon.assert.calledThrice(updateCallback);
      expect(updateCallback.firstCall.args[0]).to.equal(0);
      expect(updateCallback.secondCall.args[0]).to.equal(0.5);
      expect(updateCallback.thirdCall.args[0]).to.equal(1);
    });
  });

  describe('updateElement', () => {
    const startState = createState({});
    const endState = createState({});

    it('should use transformProperty passed in constructor', () => {
      const element = { style: {} };
      const transformProperty = 'webkitTransform';
      const animation = createAnimation(startState, endState, {},  transformProperty);

      animation.updateElement(element, true);

      expect(element.style).to.have.property(transformProperty);
    });

    it('should default to transform if no transformProperty is passed', () => {
      const element = { style: {} };
      const animation = createAnimation(startState, endState, {});

      animation.updateElement(element, true);

      expect(element.style).to.have.property('transform');
    });

    it('should use set staticTransform if present in options', () => {
      const element = { style: {} };
      const options = {
        staticTransform: 'translateX(100px)'
      };
      const animation = createAnimation(startState, endState, options);

      animation.updateElement(element, true);

      expect(element.style.transform).to.startWith(options.staticTransform);
    });
  });
});
