'use strict';
/* global document, window */
var stateFromOptions = require('./state.js').stateFromOptions;
var Animation = require('./animation.js');
var createState = require('./state.js').createState;

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

  scheduleNextFrame() {
    window.requestAnimationFrame((time) => {
      this.stepAnimations(time);
    });
  },

  stepAnimations(time) {
    this.runningAnimations.forEach((runningAnimation) => {
      var element = runningAnimation[0];
      var animation = runningAnimation[1];
      this.stepAnimation(element, animation, time);
    });

    this.archiveCompletedAnimations();

    if (this.runningAnimations.length > 0) {
      this.scheduleNextFrame();
    }
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
    // Finished and not queued
    var completed = finished.filter((finishedAnimation) => {
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
      var completeCallback = animation[1].options.complete;
      if (completeCallback)
        completeCallback();
    });

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

    var animation = Animation.createAnimation(startState, endState, options);
    return animation;
  },

  createAttentionAnimation(element, options) {
    var movement = stateFromOptions(options, createState({}, false));
    options.movement = movement;
    var animation = Animation.createAttentionAnimation(options);

    return animation;
  },

  initializeAnimation(element, arg2, arg3) {
    var animation;
    if (arg2 === 'attention') {
      animation = this.createAttentionAnimation(element, arg3);
    } else {
      animation = this.createAnimation(element, arg2);
    }
    var chainer = this.createChainer();

    this.runningAnimations.push([element, animation, chainer]);

    if (this.runningAnimations.length === 1) {
      this.scheduleNextFrame();
    }

    return chainer;
  },

  findCurrentState(element) {
    var match =  this.runningAnimations.find((animation) => element === animation[0]);
    if (match) {
      match[1].stop();
      return match[1].getCurrentState();
    }
    match =  this.completedAnimations.find((animation) => element === animation[0]);
    if (match) {
      return match[1].endState();
    }
  }
};

module.exports = Engine;
