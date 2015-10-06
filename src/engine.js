'use strict';
/* global document, window */
var stateFromOptions = require('./state.js').stateFromOptions;
var Animation = require('./animation.js');

var Engine = {
  runningAnimations: [],
  completedAnimations: [],
  transformProperty: 'transform',
  init() {
    var styles = window.getComputedStyle(document.documentElement, '');
    var vendorPrefix = (Array.prototype.slice
        .call(styles)
        .join('')
        .match(/-(moz|webkit|ms)-/) || styles.OLink === '' && ['', 'o']
      )[1];
    if (vendorPrefix === 'webkit')
      this.transformProperty = 'webkitTransform';

  },

  stepAnimations(time) {
    this.runningAnimations.forEach((runningAnimation) => {
      var element = runningAnimation[0];
      var animation = runningAnimation[1];
      this.stepAnimation(element, animation, time);
    });

    this.archiveCompletedAnimations();
  },

  stepAnimation(element, animation, time) {
    if (animation.isStopped())
      return;

    animation.tick(time);
    animation.updateElement(element);
  },

  archiveCompletedAnimations() {
    var unFinished = this.runningAnimations.filter((animation) => !animation[1].completed());
    var finished = this.runningAnimations.filter((animation) => animation[1].completed());

    Engine.runningAnimations = unFinished;
    this.completedAnimations = this.completedAnimations.filter((animation) => {
      return finished.find((finishedAnimation) => {
        return finishedAnimation[0] !== animation[0];
      });
    });
    Array.prototype.push.apply(this.completedAnimations, finished);
  },

  initializeAnimation(element, options) {
    var previousState = this.findPreviousState(element);
    var startState = stateFromOptions(options, previousState, true);
    var endState = stateFromOptions(options, null, false);

    var animation = Animation.createAnimation(startState, endState, options);

    var chainer = {
      queue: [],
      snabbt: function(opts) {
        this.queue.unshift(opts);
        return chainer;
      }
    };

    this.runningAnimations.push([element, animation, chainer]);
  },

  findPreviousState() {
    return null;
  }
};

module.exports = Engine;
