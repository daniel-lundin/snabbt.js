'use strict';

var sinon = require('sinon');
var expect = require('chai').expect;
var createAnimation = require('../animation.js').createAnimation;
var createState = require('../state.js').createState;


describe('animations', () => {

  describe('tick', () => {
    var animation;
    beforeEach(() => {
      var options = {
        startState: createState({}),
        endState: createState({})
      };
      animation = createAnimation(options);
      sinon.spy(animation, 'updateCurrentTransform');
    });

    afterEach(() => {
      animation.updateCurrentTransform.restore();
    });

    it('should set started and call updateTransform for first tick', () => {
      expect(animation.isStarted()).to.not.be.ok;
      sinon.assert.notCalled(animation.updateCurrentTransform);

      animation.tick(100);
      expect(animation.isStarted()).to.be.ok;
      sinon.assert.calledOnce(animation.updateCurrentTransform);
    });
  });


});
