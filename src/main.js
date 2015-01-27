var snabbtjs = snabbtjs || {};

/* Entry point, only function to be called by user */
snabbtjs.snabbt = function(arg1, arg2, arg3) {

  var elements = arg1;

  // If argument is an array, loop through and start one animation for each element.
  if(Array.isArray(elements)) {
    var aggregateChainer = {
      chainers: [],
      then: function(opts) {
        this.chainers.forEach(function(chainer) {
          chainer.then(opts);
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
      aggregateChainer.chainers.push(snabbtjs.snabbtSingleElement(elements[i], arg2, arg3));
    }
    return aggregateChainer;
  } else {
    return snabbtjs.snabbtSingleElement(elements, arg2, arg3);
  }
};

snabbtjs.snabbtSingleElement = function(arg1, arg2, arg3) {
  if(arg2 === 'attention')
    return snabbtjs.setupAttentionAnimation(arg1, arg3);
  if(arg2 === 'stop')
    return snabbtjs.stopAnimation(arg1);
  var element = arg1;
  var options = arg2;

  // Remove orphaned end states
  snabbtjs.clearOphanedEndStates();

  // If there is a running or past completed animation with element, use that end state as start state
  var start = snabbtjs.currentAnimationState(element);
  // from has precendance over current animation state
  start = snabbtjs.stateFromOptions(options, start, true);
  end = snabbtjs.stateFromOptions(options);

  var animOptions = snabbtjs.setupAnimationOptions(start, end, options);
  var animation = snabbtjs.createAnimation(animOptions);

  snabbtjs.runningAnimations.push([element, animation]);

  animation.updateElement(element);
  var queue = [];
  var chainer = {
    then: function(opts) {
      queue.unshift(opts);
      return chainer;
    }
  };

  function tick(time) {
    animation.tick(time);
    animation.updateElement(element);
    if(animation.stopped())
      return;

    if(!animation.completed())
      return snabbtjs.requestAnimationFrame(tick);


    if(options.loop > 1 && !animation.stopped()) {
      // Loop current animation
      options.loop -= 1;
      animation.restart();
      snabbtjs.requestAnimationFrame(tick);
    } else {
      if(options.callback) {
        options.callback();
      }

      // Start next animation in queue
      if(queue.length) {
        options = queue.pop();

        start = snabbtjs.stateFromOptions(options, end, true);
        end = snabbtjs.stateFromOptions(options);
        options = snabbtjs.setupAnimationOptions(start, end, options);

        animation = new snabbtjs.Animation(options);
        snabbtjs.runningAnimations.push([element, animation]);

        animation.tick(time);
        snabbtjs.requestAnimationFrame(tick);
      }
    }
  }

  snabbtjs.requestAnimationFrame(tick);
  if(options.manual)
    return animation;
  return chainer;
};

snabbtjs.setupAttentionAnimation = function(element,  options) {
  var movement = snabbtjs.stateFromOptions(options);
  options.movement = movement;
  var animation = new snabbtjs.AttentionAnimation(options);

  snabbtjs.runningAnimations.push([element, animation]);
  function tick(time) {
    animation.tick(time);
    animation.updateElement(element);
    if(!animation.completed()) {
      snabbtjs.requestAnimationFrame(tick);
    } else {
      if(options.callback) {
        options.callback();
      }
      if(options.loop && options.loop > 1) {
        options.loop--;
        animation.restart();
        snabbtjs.requestAnimationFrame(tick);
      }
    }
  }
  snabbtjs.requestAnimationFrame(tick);
};

snabbtjs.stopAnimation = function(element) {
  var runningAnimations = snabbtjs.runningAnimations;
  for(var i= 0,len=runningAnimations.length;i<len;++i) {
    var currentAnimation = runningAnimations[i];
    var animatedElement = currentAnimation[0];
    var animation = currentAnimation[1];

    if(animatedElement === element) {
      animation.stop();
    }
  }
};

snabbtjs.findAnimationState = function(animationList, element) {
  for(var i= 0,len=animationList.length;i<len;++i) {
    var currentAnimation = animationList[i];
    var animatedElement = currentAnimation[0];
    var animation = currentAnimation[1];

    if(animatedElement === element) {
      var state = animation.currentState();
      animation.stop();
      return state;
    }
  }
};

/**
 * Returns the current state of element if there is an ongoing or previously finished
 * animation releated to it. Will also call stop on the animation.
 * TODO: The stopping of the animation is better put somewhere else
 */
snabbtjs.currentAnimationState = function(element) {
  // Check if a completed animation is stored for this element
  var state = snabbtjs.findAnimationState(snabbtjs.runningAnimations, element);
  if(state)
    return state;
 
  return snabbtjs.findAnimationState(snabbtjs.completedAnimations, element);
};

/**
 * Parses an animation configuration object and returns a snabbtjs.State instance
 */
snabbtjs.stateFromOptions = function(options, state, useFromPrefix) {
  if (!state)
    state = new snabbtjs.State({});
  var position = 'position';
  var rotation = 'rotation';
  var skew = 'skew';
  var rotationPost = 'rotationPost';
  var scale = 'scale';
  var width = 'width';
  var height = 'height';
  var opacity = 'opacity';

  if(useFromPrefix) {
    position = 'fromPosition';
    rotation = 'fromRotation';
    skew = 'fromSkew';
    rotationPost = 'fromRotationPost';
    scale = 'fromScale';
    width = 'fromWidth';
    height = 'fromHeight';
    opacity = 'fromOpacity';
  }
  var o = options;

  if(o[position]) {
    state.x = o[position][0];
    state.y = o[position][1];
    state.z = o[position][2];
  }
  if(o[rotation]) {
    state.ax = o[rotation][0];
    state.ay = o[rotation][1];
    state.az = o[rotation][2];
  }
  if(o[skew]) {
    state.skewX = o[skew][0];
    state.skewY = o[skew][1];
  }
  if(o[rotationPost]) {
    state.bx = o[rotationPost][0];
    state.by = o[rotationPost][1];
    state.bz = o[rotationPost][2];
  }
  if(o[scale]) {
    state.sx = o[scale][0];
    state.sy = o[scale][1];
  }
  if(o[width] !== undefined) {
    state.width = o[width];
  }
  if(o[height] !== undefined) {
    state.height = o[height];
  }
  if(o[opacity] !== undefined) {
    state.opacity = o[opacity];
  }
  return state;

};

snabbtjs.setupAnimationOptions = function(start, end, options) {
  options.startState = start;
  options.endState = end;
  return options;
};

snabbtjs.tickRequests = [];
snabbtjs.runningAnimations = [];
snabbtjs.completedAnimations = [];

snabbtjs.requestAnimationFrame = function(func) {
  snabbtjs.tickRequests.push(func);
};

snabbtjs.tickAnimations = function(time) {
  var tickRequests = snabbtjs.tickRequests;
  var len = tickRequests.length;
  for(var i=0;i<len;++i) {
    tickRequests[i](time);
  }
  tickRequests.splice(0, len);
  window.requestAnimationFrame(snabbtjs.tickAnimations);

  var completedAnimations = snabbtjs.runningAnimations.filter(function(animation) {
    return animation[1].completed();
  });

  // See if there are any previously completed animations on the same element, if so, remove it before merging
  snabbtjs.completedAnimations = snabbtjs.completedAnimations.filter(function(animation) {
    for(var i=0,len=completedAnimations.length;i<len;++i) {
      if(animation[0] === completedAnimations[i][0]) {
        return false;
      }
    }
    return true;
  });

  snabbtjs.completedAnimations = snabbtjs.completedAnimations.concat(completedAnimations);

  snabbtjs.runningAnimations = snabbtjs.runningAnimations.filter(function(animation) {
    return !animation[1].completed();
  });
};

snabbtjs.clearOphanedEndStates = function() {
  snabbtjs.completedAnimations = snabbtjs.completedAnimations.filter(function(animation) {
    return (snabbtjs.findUltimateAncestor(animation[0]).body);
  });
};

snabbtjs.findUltimateAncestor = function(node) {
  var ancestor = node;
  while(ancestor.parentNode) {
    ancestor = ancestor.parentNode;
  }
  return ancestor;
};

window.requestAnimationFrame(snabbtjs.tickAnimations);
