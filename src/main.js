var snabbtjs = snabbtjs || {};

/* Entry point, only function to be called by user */
snabbtjs.snabbt = function(arg1, arg2, arg3) {

  var elements = arg1;

  // If argument is an Array or a NodeList or other list type that can be iterable.
  // Loop through and start one animation for each element.
  if(elements.hasOwnProperty('length')) {
    var aggregateChainer = {
      chainers: [],
      then: function(opts) {
        var len = this.chainers.length;
        this.chainers.forEach(function(chainer, index) {
          chainer.then(snabbtjs.preprocessOptions(opts, index, len));
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
        aggregateChainer.chainers.push(snabbtjs.snabbtSingleElement(elements[i], arg2, snabbtjs.preprocessOptions(arg3, i, len)));
      else
        aggregateChainer.chainers.push(snabbtjs.snabbtSingleElement(elements[i], snabbtjs.preprocessOptions(arg2, i, len), arg3));
    }
    return aggregateChainer;
  } else {
    if(typeof arg2 == 'string')
      return snabbtjs.snabbtSingleElement(elements, arg2, snabbtjs.preprocessOptions(arg3, 0, 1));
    else
      return snabbtjs.snabbtSingleElement(elements, snabbtjs.preprocessOptions(arg2, 0, 1), arg3);
  }
};

snabbtjs.preprocessOptions = function(options, index, len) {
  if(!options)
    return options;
  var clone = snabbtjs.cloneObject(options);
  if(snabbtjs.isFunction(options.delay)) {
    clone.delay = options.delay(index, len);
  }
  if(snabbtjs.isFunction(options.callback)) {
    clone.callback = function() {
      options.callback(index, len);
    };
  }
  if(snabbtjs.isFunction(options.valueFeeder)) {
    clone.valueFeeder = function(i, matrix) {
      return options.valueFeeder(i, matrix, index, len);
    };
  }
  if(snabbtjs.isFunction(options.easing)) {
    clone.easing = function(i) {
      return options.easing(i, index, len);
    };
  }

  var properties = [
    'position',
    'rotation',
    'skew',
    'rotationPost',
    'scale',
    'width',
    'height',
    'opacity',
    'fromPosition',
    'fromRotation',
    'fromSkew',
    'fromRotationPost',
    'fromScale',
    'fromWidth',
    'fromHeight',
    'fromOpacity',
    'transformOrigin',
    'duration',
    'delay'
  ];

  properties.forEach(function(property) {
    if(snabbtjs.isFunction(options[property])) {
      clone[property] = options[property](index, len);
    }
  });

  return clone;
};

snabbtjs.snabbtSingleElement = function(element, arg2, arg3) {
  if(arg2 === 'attention')
    return snabbtjs.setupAttentionAnimation(element, arg3);
  if(arg2 === 'stop')
    return snabbtjs.stopAnimation(element);
  var options = arg2;

  // Remove orphaned end states
  snabbtjs.clearOphanedEndStates();

  // If there is a running or past completed animation with element, use that end state as start state
  var currentState = snabbtjs.currentAnimationState(element);
  var start = currentState;
  // from has precendance over current animation state
  start = snabbtjs.stateFromOptions(options, start, true);
  var end = snabbtjs.cloneObject(currentState);
  end = snabbtjs.stateFromOptions(options, end);

  var animOptions = snabbtjs.setupAnimationOptions(start, end, options);
  var animation = snabbtjs.createAnimation(animOptions);

  snabbtjs.runningAnimations.push([element, animation]);

  animation.updateElement(element);
  var queue = [];
  var chainer = {
    then: function(opts) {
      queue.unshift(snabbtjs.preprocessOptions(opts, 0, 1));
      return chainer;
    }
  };

  function tick(time) {
    animation.tick(time);
    animation.updateElement(element);
    if(animation.isStopped())
      return;

    if(!animation.completed())
      return snabbtjs.requestAnimationFrame(tick);


    if(options.loop > 1 && !animation.isStopped()) {
      // Loop current animation
      options.loop -= 1;
      animation.restart();
      snabbtjs.requestAnimationFrame(tick);
    } else {
      if(options.callback) {
        options.callback(element);
      }

      // Start next animation in queue
      if(queue.length) {
        options = queue.pop();

        start = snabbtjs.stateFromOptions(options, end, true);
        end = snabbtjs.stateFromOptions(options, snabbtjs.cloneObject(end));
        options = snabbtjs.setupAnimationOptions(start, end, options);

        animation = new snabbtjs.Animation(options);
        snabbtjs.runningAnimations.push([element, animation]);

        animation.tick(time);
        snabbtjs.requestAnimationFrame(tick);
      }
    }
  }

  snabbtjs.requestAnimationFrame(tick);
  // Manual animations are not chainable, instead an animation controller object is returned
  // with setValue, finish and rollback methods
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
        options.callback(element);
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

  var optionOrDefault = snabbtjs.optionOrDefault;
  state.position = optionOrDefault(options[position], state.position);
  state.rotation = optionOrDefault(options[rotation], state.rotation);
  state.rotationPost = optionOrDefault(options[rotationPost], state.rotationPost);
  state.skew = optionOrDefault(options[skew], state.skew);
  state.scale = optionOrDefault(options[scale], state.scale);
  state.opacity = options[opacity];
  state.width = options[width];
  state.height = options[height];

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
  if(snabbtjs.tickRequests.length === 0)
    window.requestAnimationFrame(snabbtjs.tickAnimations);
  snabbtjs.tickRequests.push(func);
};

snabbtjs.tickAnimations = function(time) {
  var tickRequests = snabbtjs.tickRequests;
  var len = tickRequests.length;
  for(var i=0;i<len;++i) {
    tickRequests[i](time);
  }
  tickRequests.splice(0, len);

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

  if(tickRequests.length !== 0)
    window.requestAnimationFrame(snabbtjs.tickAnimations);
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
