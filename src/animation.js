'use strict';
var utils = require('./utils.js');
var easing = require('./easing.js');
var tweeners = require('./tweeners');
var state = require('./state.js');

function createAnimation(startState, endState, options) {
  var duration = utils.optionOrDefault(options.duration, 500);

  var delay = utils.optionOrDefault(options.delay, 0);
  var easer = easing.createEaser(utils.optionOrDefault(options.easing, 'linear'), options);
  var currentState = duration === 0 ? endState.clone() : startState.clone();
  currentState.transformOrigin = options.transformOrigin;

  var startTime = 0;
  var currentTime = 0;
  var stopped = false;
  var started = false;

  // Manual related
  var manual = options.manual;
  var manualValue = 0;
  var manualDelayFactor = delay / duration;
  var manualCallback;

  var tweener;
  // Setup tweener
  if (options.valueFeeder) {
    tweener = tweeners.createValueFeederTweener(options.valueFeeder,
                                                startState,
                                                endState,
                                                currentState);
  } else {
    tweener = tweeners.createStateTweener(startState, endState, currentState);
  }

  // Public api
  return {
    options: options,
    stop() { stopped = true; },
    endState() { return endState; },
    isStopped() { return stopped; },
    isStarted() { return started; },

    finish(callback) {
      manual = false;
      var manualDuration = duration * manualValue;
      startTime = currentTime - manualDuration;
      manualCallback = callback;
      easer.resetFrom(manualValue);
    },

    rollback(callback) {
      manual = false;
      tweener.setReverse();
      var manualDuration = duration * (1 - manualValue);
      startTime = currentTime - manualDuration;
      manualCallback = callback;
      easer.resetFrom(manualValue);
    },

    restart() {
      // Restart timer
      startTime = undefined;
      easer.resetFrom(0);
    },

    tick(time) {
      if (stopped)
        return;

      if (manual) {
        currentTime = time;
        return this.updateCurrentTransform();
      }

      // If first tick, set startTime
      if (!startTime) {
        startTime = time;
      }

      if (time - startTime >= delay) {
        started = true;
        currentTime = time - delay;

        var curr = Math.min(Math.max(0.0, currentTime - startTime), duration);
        easer.tick(curr / duration);
        this.updateCurrentTransform();
        if (this.completed() && manualCallback) {
          manualCallback();
        }
      }
    },

    getCurrentState: function() {
      return currentState;
    },

    setValue: function(_manualValue) {
      started = true;
      manualValue = Math.min(Math.max(_manualValue, 0.0001), 1 + manualDelayFactor);
    },

    updateCurrentTransform: function() {
      var tweenValue = easer.getValue();
      if (manual) {
        var value = Math.max(0.00001, manualValue - manualDelayFactor);
        if (easer.isSpring) {
          tweenValue = value;
        } else {
          easer.tick(value, true);
          tweenValue = easer.getValue();
        }
      }
      tweener.tween(tweenValue);
    },

    completed: function() {
      if (stopped)
        return true;
      if (startTime === 0) {
        return false;
      }
      return easer.completed();
    },

    updateElement: function(element, forceUpdate) {
      if (!started && !forceUpdate)
        return;
      var matrix = tweener.asMatrix();
      var properties = tweener.getProperties();
      utils.updateElementTransform(element, matrix, properties.perspective);
      utils.updateElementProperties(element, properties);
    }
  };
}

// ------------------------
// -- AttentionAnimation --
// ------------------------

function createAttentionAnimation(options) {
  var movement = options.movement;
  options.initialVelocity = 0.1;
  options.equilibriumPosition = 0;
  var spring = easing.createSpringEasing(options);
  var stopped = false;
  var tweenPosition = movement.position;
  var tweenRotation = movement.rotation;
  var tweenRotationPost = movement.rotationPost;
  var tweenScale = movement.scale;
  var tweenSkew = movement.skew;

  var currentMovement = state.createState({
    position: tweenPosition ? [0, 0, 0] : undefined,
    rotation: tweenRotation ? [0, 0, 0] : undefined,
    rotationPost: tweenRotationPost ? [0, 0, 0] : undefined,
    scale: tweenScale ? [1, 1] : undefined,
    skew: tweenSkew ? [0, 0] : undefined
  });

  // Public API
  return {
    options() { return options; },
    stop: function() { stopped = true; },
    isStopped() { return stopped; },

    tick() {
      if (stopped)
        return;
      if (spring.equilibrium)
        return;
      spring.tick();

      this.updateMovement();
    },

    updateMovement() {
      var value = spring.getValue();
      if  (tweenPosition) {
        currentMovement.position[0] = movement.position[0] * value;
        currentMovement.position[1] = movement.position[1] * value;
        currentMovement.position[2] = movement.position[2] * value;
      }
      if (tweenRotation) {
        currentMovement.rotation[0] = movement.rotation[0] * value;
        currentMovement.rotation[1] = movement.rotation[1] * value;
        currentMovement.rotation[2] = movement.rotation[2] * value;
      }
      if (tweenRotationPost) {
        currentMovement.rotationPost[0] = movement.rotationPost[0] * value;
        currentMovement.rotationPost[1] = movement.rotationPost[1] * value;
        currentMovement.rotationPost[2] = movement.rotationPost[2] * value;
      }
      if (tweenScale) {
        currentMovement.scale[0] = 1 + movement.scale[0] * value;
        currentMovement.scale[1] = 1 + movement.scale[1] * value;
      }

      if (tweenSkew) {
        currentMovement.skew[0] = movement.skew[0] * value;
        currentMovement.skew[1] = movement.skew[1] * value;
      }
    },

    updateElement: function(element) {
      utils.updateElementTransform(element, currentMovement.asMatrix());
      utils.updateElementProperties(element, currentMovement.getProperties());
    },

    getCurrentState: function() {
      return currentMovement;
    },

    completed: function() {
      return spring.completed() || stopped;
    },

    restart: function() {
      // Restart spring
      spring = easing.createSpringEasing(options);
    }
  };
}

module.exports = {
  createAnimation: createAnimation,
  createAttentionAnimation: createAttentionAnimation
};
