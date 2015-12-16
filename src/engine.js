'use strict';
/* global document, window */
const stateFromOptions = require('./state.js').stateFromOptions;
const Animation = require('./animation.js');
const createState = require('./state.js').createState;
const utils = require('./utils.js');

const Engine = {
  runningAnimations: [],
  completedAnimations: [],
  transformProperty: 'transform',
  rAFScheduled: false,
  init() {
    if (typeof window !== undefined) return;
    const styles = window.getComputedStyle(document.documentElement, '');
    const vendorPrefix = (Array.prototype.slice
        .call(styles)
        .join('')
        .match(/-(moz|webkit|ms)-/) || styles.OLink === '' && ['', 'o']
      )[1];
    if (vendorPrefix === 'webkit')
      this.transformProperty = 'webkitTransform';

  },

  scheduleNextFrame() {
    if (this.rAFScheduled) return;
    this.rAFScheduled = true;

    window.requestAnimationFrame((time) => {
      this.rAFScheduled = false;
      this.stepAnimations(time);
    });
  },

  stepAnimations(time) {
    this.runningAnimations.forEach((runningAnimation) => {
      const element = runningAnimation[0];
      const animation = runningAnimation[1];
      this.stepAnimation(element, animation, time);
    });

    this.archiveCompletedAnimations();

    if (this.runningAnimations.length > 0)
      this.scheduleNextFrame();
  },

  stepAnimation(element, animation, time) {
    animation.tick(time);
    animation.updateElement(element);
  },

  archiveCompletedAnimations() {
    const unFinished = this.runningAnimations.filter((animation) => !animation[1].completed());
    const finished = this.runningAnimations.filter((animation) => animation[1].completed());

    const queuedAnimations = this.createQueuedAnimations(finished);
    // Finished and not queued
    const completed = finished.filter((finishedAnimation) => {
      return !queuedAnimations.find((queuedAnimation) => {
        return queuedAnimation[0] !== finishedAnimation[0];
      });
    });

    Engine.runningAnimations = unFinished;

    // Filter out just finished animation from previously completed
    this.completedAnimations = this.completedAnimations.filter((animation) => {
      return !completed.find((finishedAnimation) => {
        return finishedAnimation[0] === animation[0];
      });
    });

    Array.prototype.push.apply(this.completedAnimations, completed);
    Array.prototype.push.apply(this.runningAnimations, queuedAnimations);

    // Call complete callback
    finished.forEach((animation) => {
      const completeCallback = animation[1].options.complete;
      if (completeCallback)
        completeCallback();
    });
    this.clearOphanedEndStates();
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
      return [animation[0], this.createAnimation(element, options, animation[1].endState()), chainer];
    });

    return newAnimations;
  },

  createChainer() {
    var chainer = {
      index: 0,
      queue: [],
      snabbt: function(opts) {
        this.queue.push(opts);
        return chainer;
      }
    };
    return chainer;
  },

  createAnimation(element, options, previousEndState) {
    var previousState = previousEndState || this.findCurrentState(element);
    var startState = stateFromOptions(options, previousState, true);
    var endState = stateFromOptions(options, previousState, false);

    this.runningAnimations = this.runningAnimations.filter((animation) => {
      return element !== animation[0];
    });
    var animation = Animation.createAnimation(startState, endState, options, this.transformProperty);
    return animation;
  },

  createAttentionAnimation(element, options) {
    var movement = stateFromOptions(options, createState({}, false));
    options.movement = movement;
    var animation = Animation.createAttentionAnimation(options);

    return animation;
  },

  stopAnimation(element) {
    const stoppedAnimation = this.runningAnimations.filter((animation) => animation[0] === element);
    this.runningAnimations = this.runningAnimations.filter((animation) => animation[0] !== element);
    Array.prototype.push.apply(this.completedAnimations, stoppedAnimation);
  },

  initializeAnimation(element, arg2, arg3) {
    let animation;
    if (arg2 === 'attention') {
      animation = this.createAttentionAnimation(element, arg3);
    } else if (arg2 === 'stop') {
      return this.stopAnimation(element);
    } else {
      animation = this.createAnimation(element, arg2);
    }
    const chainer = this.createChainer();

    animation.updateElement(element, true);

    this.runningAnimations.push([element, animation, chainer]);
    this.scheduleNextFrame();

    return arg2.manual ? animation : chainer;
  },

  findCurrentState(element) {
    var match =  this.runningAnimations.find((animation) => element === animation[0]);
    if (match) {
      return match[1].getCurrentState();
    }
    match =  this.completedAnimations.find((animation) => element === animation[0]);
    if (match) {
      return match[1].getCurrentState();
    }
  },

  clearOphanedEndStates() {
    this.completedAnimations = this.completedAnimations.filter((animation) => {
      return utils.findUltimateAncestor(animation[0]).body;
    });
  }
};

module.exports = Engine;
