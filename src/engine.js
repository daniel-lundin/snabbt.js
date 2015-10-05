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

  stepAnimation(animation, element, time) {
    if (animation.isStopped())
      return;

    animation.tick(time);
    animation.updateElement(element);
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

    //this.scheduleTick();
  },

  findPreviousState() {
    return null;
  }
};

module.exports = Engine;
