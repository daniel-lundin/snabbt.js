  var tickRequests = [];
  var runningAnimations = [];
  var completedAnimations = [];
  var transformProperty = 'transform';

  // Find which vendor prefix to use
  var styles = window.getComputedStyle(document.documentElement, '');
  var vendorPrefix = (Array.prototype.slice
      .call(styles)
      .join('')
      .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
    )[1];
  if(vendorPrefix === 'webkit')
    transformProperty = 'webkitTransform';

  /* Entry point, only function to be called by user */
  var snabbt = function(arg1, arg2, arg3) {

    var elements = arg1;

    // If argument is an Array or a NodeList or other list type that can be iterable.
    // Loop through and start one animation for each element.
    if(elements.length !== undefined) {
      var aggregateChainer = {
        chainers: [],
        then: function(opts) {
          console.log('DeprecationWarning: then() is renamed to snabbt()');
          return this.snabbt(opts);
        },
        snabbt: function(opts) {
          var len = this.chainers.length;
          this.chainers.forEach(function(chainer, index) {
            chainer.snabbt(preprocessOptions(opts, index, len));
          });
          return aggregateChainer;
        },
        setValue: function(value) {
          this.chainers.forEach(function(chainer) {
            chainer.setValue(value);
          });
          return aggregateChainer;
        },
        finish: function() {
          this.chainers.forEach(function(chainer) {
            chainer.finish();
          });
          return aggregateChainer;
        },
        rollback: function() {
          this.chainers.forEach(function(chainer) {
            chainer.rollback();
          });
          return aggregateChainer;
        }
      };

      for(var i=0, len=elements.length;i<len;++i) {
        if(typeof arg2 == 'string')
          aggregateChainer.chainers.push(snabbtSingleElement(elements[i], arg2, preprocessOptions(arg3, i, len)));
        else
          aggregateChainer.chainers.push(snabbtSingleElement(elements[i], preprocessOptions(arg2, i, len), arg3));
      }
      return aggregateChainer;
    } else {
      if(typeof arg2 == 'string')
        return snabbtSingleElement(elements, arg2, preprocessOptions(arg3, 0, 1));
      else
        return snabbtSingleElement(elements, preprocessOptions(arg2, 0, 1), arg3);
    }
  };


  var snabbtSingleElement = function(element, arg2, arg3) {
    if(arg2 === 'attention')
      return setupAttentionAnimation(element, arg3);
    if(arg2 === 'stop')
      return stopAnimation(element);
    var options = arg2;

    // Remove orphaned end states
    clearOphanedEndStates();

    // If there is a running or past completed animation with element, use that end state as start state
    var currentState = currentAnimationState(element);
    var start = currentState;
    // from has precendance over current animation state
    start = stateFromOptions(options, start, true);
    var end = cloneObject(currentState);
    end = stateFromOptions(options, end);

    var animOptions = setupAnimationOptions(start, end, options);
    var animation = createAnimation(animOptions);

    runningAnimations.push([element, animation]);

    animation.updateElement(element, true);
    var queue = [];
    var chainer = {
      snabbt: function(opts) {
        queue.unshift(preprocessOptions(opts, 0, 1));
        return chainer;
      },
      then: function(opts) {
        console.log('DeprecationWarning: then() is renamed to snabbt()');
        return this.snabbt(opts);
      }
    };

    function tick(time) {
      animation.tick(time);
      animation.updateElement(element);
      if(animation.isStopped())
        return;

      if(!animation.completed())
        return queueTick(tick);

      if(options.loop > 1 && !animation.isStopped()) {
        // Loop current animation
        options.loop -= 1;
        animation.restart();
        queueTick(tick);
      } else {
        if(options.complete) {
          options.complete.call(element);
        }

        // Start next animation in queue
        if(queue.length) {
          options = queue.pop();

          start = stateFromOptions(options, end, true);
          end = stateFromOptions(options, cloneObject(end));
          options = setupAnimationOptions(start, end, options);

          animation = createAnimation(options);
          runningAnimations.push([element, animation]);

          animation.tick(time);
          queueTick(tick);
        }
      }
    }

    queueTick(tick);
    // Manual animations are not chainable, instead an animation controller object is returned
    // with setValue, finish and rollback methods
    if(options.manual)
      return animation;
    return chainer;
  };

  var setupAttentionAnimation = function(element,  options) {
    var movement = stateFromOptions(options, createState({}));
    options.movement = movement;
    var animation = createAttentionAnimation(options);

    runningAnimations.push([element, animation]);
    function tick(time) {
      animation.tick(time);
      animation.updateElement(element);
      if(!animation.completed()) {
        queueTick(tick);
      } else {
        if(options.callback) {
          options.callback(element);
        }
        if(options.loop && options.loop > 1) {
          options.loop--;
          animation.restart();
          queueTick(tick);
        }
      }
    }
    queueTick(tick);
  };

  var stopAnimation = function(element) {
    for(var i= 0,len=runningAnimations.length;i<len;++i) {
      var currentAnimation = runningAnimations[i];
      var animatedElement = currentAnimation[0];
      var animation = currentAnimation[1];

      if(animatedElement === element) {
        animation.stop();
      }
    }
  };

  var findAnimationState = function(animationList, element) {
    for(var i=0,len=animationList.length;i<len;++i) {
      var currentAnimation = animationList[i];
      var animatedElement = currentAnimation[0];
      var animation = currentAnimation[1];

      if(animatedElement === element) {
        var state = animation.getCurrentState();
        animation.stop();
        return state;
      }
    }
  };

  var clearOphanedEndStates = function() {
    completedAnimations = completedAnimations.filter(function(animation) {
      return (findUltimateAncestor(animation[0]).body);
    });
  };

  var findUltimateAncestor = function(node) {
    var ancestor = node;
    while(ancestor.parentNode) {
      ancestor = ancestor.parentNode;
    }
    return ancestor;
  };

  /**
   * Returns the current state of element if there is an ongoing or previously finished
   * animation releated to it. Will also call stop on the animation.
   * TODO: The stopping of the animation is better put somewhere else
   */
  var currentAnimationState = function(element) {
    // Check if a completed animation is stored for this element
    var state = findAnimationState(runningAnimations, element);
    if(state)
      return state;

    return findAnimationState(completedAnimations, element);
  };


  var setupAnimationOptions = function(start, end, options) {
    options.startState = start;
    options.endState = end;
    return options;
  };

  var polyFillrAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) { return setTimeout(callback, 1000 / 60); };

  var queueTick = function(func) {
    if(tickRequests.length === 0)
      polyFillrAF(tickAnimations);
    tickRequests.push(func);
  };

  var tickAnimations = function(time) {
    var len = tickRequests.length;
    for(var i=0;i<len;++i) {
      tickRequests[i](time);
    }
    tickRequests.splice(0, len);

    var finishedAnimations = runningAnimations.filter(function(animation) {
      return animation[1].completed();
    });

    // See if there are any previously completed animations on the same element, if so, remove it before merging
    completedAnimations = completedAnimations.filter(function(animation) {
      for(var i=0,len=finishedAnimations.length;i<len;++i) {
        if(animation[0] === finishedAnimations[i][0]) {
          return false;
        }
      }
      return true;
    });

    completedAnimations = completedAnimations.concat(finishedAnimations);

    runningAnimations = runningAnimations.filter(function(animation) {
      return !animation[1].completed();
    });

    if(tickRequests.length !== 0)
      polyFillrAF(tickAnimations);
  };


  // Class for handling animation between two states
  var createAnimation = function(options) {
    var startState = options.startState;
    var endState = options.endState;
    var duration = optionOrDefault(options.duration, 500);
    var delay = optionOrDefault(options.delay, 0);
    var perspective = options.perspective;
    var easing = createEaser(optionOrDefault(options.easing, 'linear'), options);
    var currentState = duration === 0 ? endState.clone() : startState.clone();
    var transformOrigin = options.transformOrigin;
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
    if(options.valueFeeder) {
      tweener = createValueFeederTweener(options.valueFeeder,
                                         startState,
                                         endState,
                                         currentState);
    } else {
      tweener = createStateTweener(startState, endState, currentState);
    }

    // Public api
    return {
      stop: function() {
        stopped = true;
      },
      isStopped: function() {
        return stopped;
      },

      finish: function(callback) {
        manual = false;
        var manualDuration = duration * manualValue;
        startTime = currentTime - manualDuration;
        manualCallback = callback;
        easing.resetFrom(manualValue);
      },

      rollback: function(callback) {
        manual = false;
        tweener.setReverse();
        var manualDuration = duration * (1 - manualValue);
        startTime = currentTime - manualDuration;
        manualCallback = callback;
        easing.resetFrom(manualValue);
      },

      restart: function() {
        // Restart timer
        startTime = undefined;
        easing.resetFrom(0);
      },

      tick: function(time) {
        if(stopped)
          return;

        if(manual) {
          currentTime = time;
          this.updateCurrentTransform();
          return;
        }

        // If first tick, set startTime
        if(!startTime) {
          startTime = time;
        }
        if(time - startTime > delay) {
          started = true;
          currentTime = time - delay;

          var curr = Math.min(Math.max(0.0, currentTime - startTime), duration);
          easing.tick(curr / duration);
          this.updateCurrentTransform();
          if(this.completed() && manualCallback) {
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
        var tweenValue = easing.getValue();
        if(manual) {
          var value = Math.max(0.00001, manualValue - manualDelayFactor);
          if(easing.isSpring) {
            tweenValue = value;
          } else {
            easing.tick(value, true);
            tweenValue = easing.getValue();
          }
        }
        tweener.tween(tweenValue);
      },

      completed: function() {
        if(stopped)
          return true;
        if(startTime === 0) {
          return false;
        }
        return easing.completed();
      },

      updateElement: function(element, forceUpdate) {
        if(!started && !forceUpdate)
          return;
        var matrix = tweener.asMatrix();
        var properties = tweener.getProperties();
        updateElementTransform(element, matrix, perspective);
        updateElementProperties(element, properties);
      }
    };
  };

  // ------------------------------
  // End Time animation
  // ------------------------------

  // ------------------------
  // -- AttentionAnimation --
  // ------------------------

  var createAttentionAnimation = function(options) {
    var movement = options.movement;
    options.initialVelocity = 0.1;
    options.equilibriumPosition = 0;
    var spring = createSpringEasing(options);
    var stopped = false;
    var tweenPosition = movement.position;
    var tweenRotation = movement.rotation;
    var tweenRotationPost = movement.rotationPost;
    var tweenScale = movement.scale;
    var tweenScalePost = movement.scalePost;
    var tweenSkew = movement.skew;

    var currentMovement = createState({
      position: tweenPosition ? [0, 0, 0] : undefined,
      rotation: tweenRotation ? [0, 0, 0] : undefined,
      rotationPost: tweenRotationPost ? [0, 0, 0] : undefined,
      scale: tweenScale ? [0, 0] : undefined,
      skew: tweenSkew ? [0, 0] : undefined,
    });

    // Public API
    return {
      stop: function() {
        stopped = true;
      },

      isStopped: function(time) {
        return stopped;
      },

      tick: function(time) {
        if(stopped)
          return;
        if(spring.equilibrium)
          return;
        spring.tick();

        this.updateMovement();
      },

      updateMovement:function() {
        var value = spring.getValue();
        if(tweenPosition) {
          currentMovement.position[0] = movement.position[0] * value;
          currentMovement.position[1] = movement.position[1] * value;
          currentMovement.position[2] = movement.position[2] * value;
        }
        if(tweenRotation) {
          currentMovement.rotation[0] = movement.rotation[0] * value;
          currentMovement.rotation[1] = movement.rotation[1] * value;
          currentMovement.rotation[2] = movement.rotation[2] * value;
        }
        if(tweenRotationPost) {
          currentMovement.rotationPost[0] = movement.rotationPost[0] * value;
          currentMovement.rotationPost[1] = movement.rotationPost[1] * value;
          currentMovement.rotationPost[2] = movement.rotationPost[2] * value;
        }
        if(tweenScale) {
          currentMovement.scale[0] = 1 + movement.scale[0] * value;
          currentMovement.scale[1] = 1 + movement.scale[1] * value;
        }
        if(tweenScalePost) {
          currentMovement.scalePost[0] = 1 + movement.scalePost[0] * value;
          currentMovement.scalePost[1] = 1 + movement.scalePost[1] * value;
        }

        if(tweenSkew) {
          currentMovement.skew[0] = movement.skew[0] * value;
          currentMovement.skew[1] = movement.skew[1] * value;
        }
      },

      updateElement: function(element) {
        updateElementTransform(element, currentMovement.asMatrix());
        updateElementProperties(element, currentMovement.getProperties());
      },

      getCurrentState: function() {
        return currentMovement;
      },

      completed: function() {
        return spring.equilibrium || stopped;
      },

      restart: function() {
        // Restart spring
        spring = createSpringEasing(options);
      }
    };
  };


  if(window.jQuery) {
    (function ( $ ) {
      $.fn.snabbt = function(arg1, arg2) {
        return snabbt(this.get(), arg1, arg2);
      };
    }( jQuery ));
  }

  snabbt.createMatrix = createMatrix;
  snabbt.setElementTransform = updateElementTransform;
  return snabbt;
