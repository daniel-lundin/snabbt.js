'use strict';

var createMatrix = require('./matrix.js');

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

module.exports = function() {
  createMatrix();
};

