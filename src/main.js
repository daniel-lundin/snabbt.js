var snabbtjs = snabbtjs || {};

/* Entry point, only function to be called by user */
snabbtjs.snabbt = function(arg1, arg2, arg3) {

  var elements = arg1;

  // If argument is an array, loop through and start one animation for each element.
  if(elements.hasOwnProperty('length')) {
    var queue = [];
    var aggregateChainer = {
      chainers: [],
      then: function(opts) {
        for(var j=0;j<this.chainers.length;++j) {
          this.chainers[j].then(opts);
        }
        return aggregateChainer;
      }
    };

    for(var i=0;i<elements.length;++i) {
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
  start = snabbtjs.stateFromFromOptions(start, options);
  var end = new snabbtjs.State({});
  end = snabbtjs.stateFromOptions(end, options);

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
      animation = snabbtjs.createAnimation(animOptions);
      snabbtjs.requestAnimationFrame(tick);
    } else {
      if(options.callback) {
        options.callback();
      }

      // Start next animation in queue
      if(queue.length) {
        options = queue.pop();

        start = snabbtjs.stateFromFromOptions(end, options);
        end = snabbtjs.stateFromOptions(new snabbtjs.State({}), options);
        snabbtjs.setupAnimationOptions(start, end, options);
        animation = new snabbtjs.Animation(options);
        snabbtjs.runningAnimations.push([element, animation]);

        animation.tick(time);
        snabbtjs.requestAnimationFrame(tick);
      }
    }
  }

  snabbtjs.requestAnimationFrame(tick);
  return chainer;
};

snabbtjs.setupAttentionAnimation = function(element,  options) {
  var movement = snabbtjs.stateFromOptions(new snabbtjs.State({}), options);
  options.movement = movement;
  var animation = new snabbtjs.AttentionAnimation(options);

  snabbtjs.runningAnimations.push([element, animation]);
  function tick(time) {
    animation.tick(time);
    animation.updateElement(element);
    if(!animation.completed()) {
      snabbtjs.requestAnimationFrame(tick);
    }
  }
  snabbtjs.requestAnimationFrame(tick);
};

snabbtjs.stopAnimation = function(element) {
  for(var i=0;i<snabbtjs.runningAnimations.length;++i) {
    var animatedElement = snabbtjs.runningAnimations[i][0];
    var animation = snabbtjs.runningAnimations[i][1];

    if(animatedElement === element) {
      animation.stop();
    }
  }
};

snabbtjs.findAnimationState = function(animationList, element) {
  for(var i=0;i<animationList.length;++i) {
    var animatedElement = animationList[i][0];
    var animation = animationList[i][1];

    if(animatedElement === element) {
      state = animation.currentState();
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
  var state = snabbtjs.findAnimationState(snabbtjs.runningAnimations, element);
  if(state)
    return state;

  // Check if a completed animation is stored for this element
  return snabbtjs.findAnimationState(snabbtjs.completedAnimations, element);
};

/**
 * Parses an animation configuration object and returns a snabbtjs.State instance
 */
snabbtjs.stateFromOptions = function(p, options) {
  if(!p)
    p = new snabbtjs.State({});

  if(options.position) {
    p.x = options.position[0];
    p.y = options.position[1];
    p.z = options.position[2];
  }
  if(options.rotation) {
    p.ax =  options.rotation[0];
    p.ay =  options.rotation[1];
    p.az =  options.rotation[2];
  }
  if(options.skew) {
    p.skewX =  options.skew[0];
    p.skewY =  options.skew[1];
  }
  if(options.rotationPost) {
    p.bx =  options.rotationPost[0];
    p.by =  options.rotationPost[1];
    p.bz =  options.rotationPost[2];
  }
  if(options.scale) {
    p.sx =  options.scale[0];
    p.sy =  options.scale[1];
  }
  if(options.width !== undefined) {
    p.width =  options.width;
  }
  if(options.height !== undefined) {
    p.height =  options.height;
  }
  if(options.opacity !== undefined) {
    p.opacity =  options.opacity;
  }
  return p;
};

snabbtjs.stateFromFromOptions = function(p, options) {
  if(!p)
    p = new snabbtjs.State({});

  if(options.fromPosition) {
    p.x = options.fromPosition[0];
    p.y = options.fromPosition[1];
    p.z = options.fromPosition[2];
  }
  if(options.fromRotation) {
    p.ax =  options.fromRotation[0];
    p.ay =  options.fromRotation[1];
    p.az =  options.fromRotation[2];
  }
  if(options.fromSkew) {
    p.skewX =  options.fromSkew[0];
    p.skewY =  options.fromSkew[1];
  }
  if(options.fromRotationPost) {
    p.bx =  options.fromRotationPost[0];
    p.by =  options.fromRotationPost[1];
    p.bz =  options.fromRotationPost[2];
  }
  if(options.fromScale) {
    p.sx =  options.fromScale[0];
    p.sy =  options.fromScale[1];
  }
  if(options.fromWidth !== undefined) {
    p.width =  options.fromWidth;
  }
  if(options.fromHeight !== undefined) {
    p.height =  options.fromHeight;
  }
  if(options.fromOpacity !== undefined) {
    p.opacity =  options.fromOpacity;
  }
  return p;
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
  var len = snabbtjs.tickRequests.length;
  for(var i=0;i<len;++i) {
    snabbtjs.tickRequests[i](time);
  }
  snabbtjs.tickRequests.splice(0, len);
  window.requestAnimationFrame(snabbtjs.tickAnimations);

  var completedAnimations = snabbtjs.runningAnimations.filter(function(animation) {
    return animation[1].completed();
  });

  // See if there are any previously completed animations on the same element, if so, remove it before merging
  snabbtjs.completedAnimations = snabbtjs.completedAnimations.filter(function(animation) {
    for(var i=0;i<completedAnimations.length;++i) {
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
