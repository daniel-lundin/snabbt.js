var snabbtjs = snabbtjs || {};

/* Entry point, only function to be called by user */
snabbtjs.snabbt = function(arg1, arg2, arg3) {

  var elements = arg1;

  // If argument is an array, loop through and start one animation for each element.
  if(Array.isArray(elements)) {
    var aggregateChainer = {
      chainers: [],
      then: function(opts) {
        var chainers = this.chainers;
        var len = this.chainers.length;
        for(var j=0;j<len;++j) {
          chainers[j].then(opts);
        }
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
      animation.restart();
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
        options = snabbtjs.setupAnimationOptions(start, end, options);

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
snabbtjs.stateFromOptions = function(p, options) {
  if(!p)
    p = new snabbtjs.State({});
  var position = options.position;
  var rotation = options.rotation;
  var skew = options.skew;
  var rotationPost = options.rotationPost;
  var scale = options.scale;
  var width = options.width;
  var height = options.height;
  var opacity = options.opacity;

  if(position) {
    p.x = position[0];
    p.y = position[1];
    p.z = position[2];
  }
  if(rotation) {
    p.ax = rotation[0];
    p.ay = rotation[1];
    p.az = rotation[2];
  }
  if(skew) {
    p.skewX = skew[0];
    p.skewY = skew[1];
  }
  if(rotationPost) {
    p.bx = rotationPost[0];
    p.by = rotationPost[1];
    p.bz = rotationPost[2];
  }
  if(scale) {
    p.sx = scale[0];
    p.sy = scale[1];
  }
  if(width !== undefined) {
    p.width = width;
  }
  if(height !== undefined) {
    p.height = height;
  }
  if(opacity !== undefined) {
    p.opacity = opacity;
  }
  return p;
};

snabbtjs.stateFromFromOptions = function(p, options) {
  var fromPosition = options.fromPosition;
  var fromRotation = options.fromRotation;
  var fromSkew = options.fromSkew;
  var fromRotationPost = options.fromRotationPost;
  var fromScale = options.fromScale;
  var fromWidth = options.fromWidth;
  var fromHeight = options.fromHeight;
  var fromOpacity = options.fromOpacity;
  if(!p)
    p = new snabbtjs.State({});

  if(fromPosition) {
    p.x = fromPosition[0];
    p.y = fromPosition[1];
    p.z = fromPosition[2];
  }
  if(fromRotation) {
    p.ax =  fromRotation[0];
    p.ay =  fromRotation[1];
    p.az =  fromRotation[2];
  }
  if(fromSkew) {
    p.skewX =  fromSkew[0];
    p.skewY =  fromSkew[1];
  }
  if(fromRotationPost) {
    p.bx =  fromRotationPost[0];
    p.by =  fromRotationPost[1];
    p.bz =  fromRotationPost[2];
  }
  if(fromScale) {
    p.sx =  fromScale[0];
    p.sy =  fromScale[1];
  }
  if(fromWidth !== undefined) {
    p.width =  fromWidth;
  }
  if(fromHeight !== undefined) {
    p.height =  fromHeight;
  }
  if(fromOpacity !== undefined) {
    p.opacity =  fromOpacity;
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
