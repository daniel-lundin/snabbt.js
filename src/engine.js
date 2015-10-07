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
    var queuedAnimations = this.createQueuedAnimations(finished);
    finished = this.runningAnimations.filter((finishedAnimation) => {
      return !queuedAnimations.find((queuedAnimation) => {
        return queuedAnimation[0] !== finishedAnimation[0];
      });
    });


    Engine.runningAnimations = unFinished;
    this.completedAnimations = this.completedAnimations.filter((animation) => {
      return finished.find((finishedAnimation) => {
        return finishedAnimation[0] !== animation[0];
      });
    });
    Array.prototype.push.apply(this.completedAnimations, finished);
    Array.prototype.push.apply(this.runningAnimations, queuedAnimations);
  },

  createQueuedAnimations(finished) {
    var newAnimations = finished.filter((animation) => {
      var chainer = animation[2];
      return chainer.index < chainer.queue.length;
    }).map((animation) => {
      var element = animation[0];
      var chainer = animation[2];
      var options = chainer.queue[chainer.index];
      chainer.index++;
      return [animation[0], this.createAnimation(element, options), chainer];
    });

    return newAnimations;
  },

  createChainer() {
    var chainer = {
      index: 0,
      queue: [],
      snabbt: function(opts) {
        this.queue.unshift(opts);
        return chainer;
      }
    };
    return chainer;
  },

  createAnimation(element, options) {
    var previousState = this.findPreviousState(element);
    var startState = stateFromOptions(options, previousState, true);
    var endState = stateFromOptions(options, null, false);

    var animation = Animation.createAnimation(startState, endState, options);
    return animation;

  },
  initializeAnimation(element, options) {
    var animation = this.createAnimation(element, options);
    var chainer = this.createChainer();

    this.runningAnimations.push([element, animation, chainer]);

    return chainer;
  },

  findPreviousState() {
    return null;
  }
};

module.exports = Engine;
