(function (root, factory) {
  if (typeof exports === 'object') {
    // CommonJS
    module.exports = factory().snabbt;
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define([], function () {
      return (root.returnExportsGlobal = factory().snabbt);
    });
  } else {
    // Global Variables

    root.snabbt = factory().snabbt;
  }
}(this, function () {

;var snabbtjs = snabbtjs || {};

// ------------------------------
// Time animation
// ------------------------------

snabbtjs.Animation = function(options) {
  this._startState = options.startState;
  this._endState = options.endState;
  this.offset = options.offset;
  this.duration = options.duration || 500;
  this.delay = options.delay || 0;
  this.easing = snabbtjs.createEaser('linear');
  this.perspective = options.perspective;
  if(options.easing)
    this.easing = snabbtjs.createEaser(options.easing, options);
  this._currentState = this._startState.clone();
  var currentState = this._currentState;
  var endState = this._endState;
  if(options.offset) {
    currentState.offsetX = this.offset[0];
    currentState.offsetY = this.offset[1];
    currentState.offsetZ = this.offset[2];
    endState.offsetX = this.offset[0];
    endState.offsetY = this.offset[1];
    endState.offsetZ = this.offset[2];
  }

  this.startTime = 0;
  this.currentTime = 0;
  this._stopped = false;
};

snabbtjs.Animation.prototype.stop = function() {
  this._stopped = true;
};

snabbtjs.Animation.prototype.stopped = function() {
  return this._stopped;
};

snabbtjs.Animation.prototype.tick = function(time) {
  var startTime = this.startTime;
  var currentTime = this.currentTime;
  var delay = this.delay;
  var duration = this.duration;
  if(this._stopped)
    return;

  // If first tick, set start_time
  if(!startTime)
    this.startTime = startTime = time;
  if(time - startTime > delay)
    this.currentTime = currentTime = time - delay;

  var curr = Math.min(Math.max(0.0, currentTime - startTime), duration);

  this.easing.tick(curr/duration);
  this.updateCurrentTransform();
};

snabbtjs.Animation.prototype.currentState = function() {
  return this._currentState;
};

snabbtjs.Animation.prototype.updateCurrentTransform = function() {
  var tweenValue = this.easing.value();
  snabbtjs.TweenStates(this._startState, this._endState, this._currentState, tweenValue);
};

snabbtjs.Animation.prototype.completed = function() {
  if(this._stopped)
    return true;
  if(this.startTime === 0) {
    return false;
  }
  return this.easing.completed();
};

snabbtjs.Animation.prototype.updateElement = function(element) {
  var matrix = this._currentState.asMatrix();
  var properties = this._currentState.properties();
  snabbtjs.updateElementTransform(element, matrix, this.perspective);
  snabbtjs.updateElementProperties(element, properties);
};

// ------------------------------
// End Time animation
// ------------------------------

// ------------------------------
// Value feeded animation
// ------------------------------

snabbtjs.ValueFeededAnimation = function(options) {
  this.valueFeeder = options.valueFeeder;
  this.duration = options.duration || 500;
  this.delay = options.delay || 0;
  this.perspective = options.perspective;

  this.easing = snabbtjs.createEaser('linear');
  if(options.easing)
    this.easing = snabbtjs.createEaser(options.easing, options);
  this._currentState = new snabbtjs.State({});
  this.currentMatrix = this.valueFeeder(0, new snabbtjs.Matrix());

  this.startTime = 0;
  this.currentTime = 0;
  this._stopped = false;
};

snabbtjs.ValueFeededAnimation.prototype.stop = function() {
  this._stopped = true;
};

snabbtjs.ValueFeededAnimation.prototype.stopped = function() {
  return this._stopped;
};

snabbtjs.ValueFeededAnimation.prototype.tick = function(time) {
  if(this._stopped)
    return;

  // If first tick, set start_time
  if(!this.startTime)
    this.startTime = time;
  if(time - this.startTime > this.delay)
    this.currentTime = time - this.delay;

  //console.log(this.currentTime);
  var curr = Math.min(Math.max(0.001, this.currentTime - this.startTime), this.duration);
  this.easing.tick(curr/this.duration);

  this.updateCurrentTransform();
};

snabbtjs.ValueFeededAnimation.prototype.currentState = function() {
  return this._currentState;
};

snabbtjs.ValueFeededAnimation.prototype.updateCurrentTransform = function() {
  var tweenValue = this.easing.value();
  var currentMatrix = this.currentMatrix;
  currentMatrix.clear();
  this.currentMatrix = this.valueFeeder(tweenValue, currentMatrix);
};

snabbtjs.ValueFeededAnimation.prototype.completed = function() {
  if(this._stopped)
    return true;
  return this.easing.completed();
};

snabbtjs.ValueFeededAnimation.prototype.updateElement = function(element) {
  snabbtjs.updateElementTransform(element, this.currentMatrix.data, this.perspective);
};

// ------------------------------
// End value feeded animation
// ------------------------------

// ------------------------
// -- AttentionAnimation --
// ------------------------

snabbtjs.AttentionAnimation = function(options) {
  this.movement = options.movement;
  this.currentMovement = new snabbtjs.State({});
  options.initialVelocity = 0.1;
  options.equilibriumPosition = 0;
  this.spring = new snabbtjs.SpringEasing(options);
  this._stopped = false;
};

snabbtjs.AttentionAnimation.prototype.stop = function() {
  this._stopped = true;
};

snabbtjs.AttentionAnimation.prototype.stopped = function(time) {
  return this._stopped;
};

snabbtjs.AttentionAnimation.prototype.tick = function(time) {
  var spring = this.spring;
  if(this._stopped)
    return;
  if(spring.equilibrium)
    return;
  spring.tick();

  this.updateMovement();
};

snabbtjs.AttentionAnimation.prototype.updateMovement = function() {
  var currentMovement = this.currentMovement;
  var movement = this.movement;
  var position = this.spring.position;
  currentMovement.x = movement.x * position;
  currentMovement.y = movement.y * position;
  currentMovement.z = movement.z * position;
  currentMovement.ax = movement.ax * position;
  currentMovement.ay = movement.ay * position;
  currentMovement.az = movement.az * position;
  currentMovement.bx = movement.bx * position;
  currentMovement.by = movement.by * position;
  currentMovement.bz = movement.bz * position;
};

snabbtjs.AttentionAnimation.prototype.updateElement = function(element) {
  var currentMovement = this.currentMovement;
  var matrix = currentMovement.asMatrix();
  var properties = currentMovement.properties();
  snabbtjs.updateElementTransform(element, matrix);
  snabbtjs.updateElementProperties(element, properties);
};

snabbtjs.AttentionAnimation.prototype.currentState = function() {
  return this.currentMovement;
};

snabbtjs.AttentionAnimation.prototype.completed = function() {
  return this.spring.equilibrium || this._stopped;
};

// Returns animation constructors based on options
snabbtjs.createAnimation = function(options) {
  if(options.valueFeeder)
    return new snabbtjs.ValueFeededAnimation(options);
  return new snabbtjs.Animation(options);
};
;// Steppers

var snabbtjs = snabbtjs || {};

snabbtjs.linearEasing = function(value) {
  return value;
};

snabbtjs.ease = function(value) {
  return (Math.cos(value*Math.PI + Math.PI) + 1)/2;
};

snabbtjs.easeIn = function(value) {
  return value*value;
};

snabbtjs.easeOut = function(value) {
  return -Math.pow(value - 1, 2) + 1;
};

snabbtjs.SpringEasing = function(options) {
  var optionOrDefault = snabbtjs.optionOrDefault;
  this.position = optionOrDefault(options.startPosition, 0);
  this.equilibriumPosition = optionOrDefault(options.equilibriumPosition, 1);
  this.velocity = optionOrDefault(options.initialVelocity, 0);
  this.springConstant = optionOrDefault(options.springConstant, 0.8);
  this.deceleration = optionOrDefault(options.springDeceleration, 0.9);
  this.mass = optionOrDefault(options.springMass, 10);

  this.equilibrium = false;
};

snabbtjs.SpringEasing.prototype.tick = function(value) {
  if(value === 0.0)
    return;
  if(this.equilibrium)
    return;
  var springForce = -(this.position - this.equilibriumPosition) * this.springConstant;
  // f = m * a
  // a = f / m
  var a = springForce / this.mass;
  // s = v * t
  // t = 1 ( for now )
  this.velocity += a;
  this.position += this.velocity;

  // Deceleration
  this.velocity *= this.deceleration;

  if(Math.abs(this.position - this.equilibriumPosition) < 0.001 && Math.abs(this.velocity) < 0.001) {
    this.equilibrium = true;
  }
};

snabbtjs.SpringEasing.prototype.value = function() {
  return this.position;
};

snabbtjs.SpringEasing.prototype.completed = function() {
  return this.equilibrium;
};

snabbtjs.EASING_FUNCS = {
  'linear': snabbtjs.linearEasing,
  'ease': snabbtjs.ease,
  'easeIn': snabbtjs.easeIn,
  'easeOut': snabbtjs.easeOut,
};

snabbtjs.Easer = function(easer) {
  this.easer = easer;
  this._value = 0;
};

snabbtjs.Easer.prototype.tick = function(value) {
  this._value = this.easer(value);
  this.lastValue = value;
};

snabbtjs.Easer.prototype.value = function() {
  return this._value;
};

snabbtjs.Easer.prototype.completed = function() {
  return this.lastValue >= 1;
};

snabbtjs.createEaser = function(easerName, options) {
  if(easerName == 'spring') {
    return new snabbtjs.SpringEasing(options);
  }
  var easeFunction;
  if(snabbtjs.isFunction(easerName)) {
    easeFunction = easerName;
  } else {
    easeFunction = snabbtjs.EASING_FUNCS[easerName];
  }
  return new snabbtjs.Easer(easeFunction);
};
;if(window.jQuery) {
  (function ( $ ) {
    $.fn.snabbt = function(arg1, arg2) {
      return snabbtjs.snabbt(this.get(), arg1, arg2);
    };
  }( jQuery ));
}
;var snabbtjs = snabbtjs || {};

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
;var snabbtjs = snabbtjs || {};

snabbtjs.assignTranslate = function(matrix, x, y, z) {
  matrix[0] = 1;
  matrix[1] = 0;
  matrix[2] = 0;
  matrix[3] = 0;
  matrix[4] = 0;
  matrix[5] = 1;
  matrix[6] = 0;
  matrix[7] = 0;
  matrix[8] = 0;
  matrix[9] = 0;
  matrix[10] = 1;
  matrix[11] = 0;
  matrix[12] = x;
  matrix[13] = y;
  matrix[14] = z;
  matrix[15] = 1;
};

snabbtjs.assignRotateX = function(matrix, rad) {
  matrix[0] = 1;
  matrix[1] = 0;
  matrix[2] = 0;
  matrix[3] = 0;
  matrix[4] = 0;
  matrix[5] = Math.cos(rad);
  matrix[6] = -Math.sin(rad);
  matrix[7] = 0;
  matrix[8] = 0;
  matrix[9] = Math.sin(rad);
  matrix[10] = Math.cos(rad);
  matrix[11] = 0;
  matrix[12] = 0;
  matrix[13] = 0;
  matrix[14] = 0;
  matrix[15] = 1;
};


snabbtjs.assignRotateY = function(matrix, rad) {
  matrix[0] = Math.cos(rad);
  matrix[1] = 0;
  matrix[2] = Math.sin(rad);
  matrix[3] = 0;
  matrix[4] = 0;
  matrix[5] = 1;
  matrix[6] = 0;
  matrix[7] = 0;
  matrix[8] = -Math.sin(rad);
  matrix[9] = 0;
  matrix[10] = Math.cos(rad);
  matrix[11] = 0;
  matrix[12] = 0;
  matrix[13] = 0;
  matrix[14] = 0;
  matrix[15] = 1;
};

snabbtjs.assignRotateZ = function(matrix, rad) {
  matrix[0] = Math.cos(rad);
  matrix[1] = -Math.sin(rad);
  matrix[2] = 0;
  matrix[3] = 0;
  matrix[4] = Math.sin(rad);
  matrix[5] = Math.cos(rad);
  matrix[6] = 0;
  matrix[7] = 0;
  matrix[8] = 0;
  matrix[9] = 0;
  matrix[10] = 1;
  matrix[11] = 0;
  matrix[12] = 0;
  matrix[13] = 0;
  matrix[14] = 0;
  matrix[15] = 1;
};

snabbtjs.assignSkew = function(matrix, ax, ay) {
  matrix[0] = 1;
  matrix[1] = Math.tan(ax);
  matrix[2] = 0;
  matrix[3] = 0;
  matrix[4] = Math.tan(ay);
  matrix[5] = 1;
  matrix[6] = 0;
  matrix[7] = 0;
  matrix[8] = 0;
  matrix[9] = 0;
  matrix[10] = 1;
  matrix[11] = 0;
  matrix[12] = 0;
  matrix[13] = 0;
  matrix[14] = 0;
  matrix[15] = 1;
};


snabbtjs.assignScale = function(matrix, x, y) {
  matrix[0] = x;
  matrix[1] = 0;
  matrix[2] = 0;
  matrix[3] = 0;
  matrix[4] = 0;
  matrix[5] = y;
  matrix[6] = 0;
  matrix[7] = 0;
  matrix[8] = 0;
  matrix[9] = 0;
  matrix[10] = 1;
  matrix[11] = 0;
  matrix[12] = 0;
  matrix[13] = 0;
  matrix[14] = 0;
  matrix[15] = 1;
};

snabbtjs.assignIdentity = function(matrix) {
  matrix[0] = 1;
  matrix[1] = 0;
  matrix[2] = 0;
  matrix[3] = 0;
  matrix[4] = 0;
  matrix[5] = 1;
  matrix[6] = 0;
  matrix[7] = 0;
  matrix[8] = 0;
  matrix[9] = 0;
  matrix[10] = 1;
  matrix[11] = 0;
  matrix[12] = 0;
  matrix[13] = 0;
  matrix[14] = 0;
  matrix[15] = 1;
};

snabbtjs.copyArray = function(a, b) {
  b[0] = a[0];
  b[1] = a[1];
  b[2] = a[2];
  b[3] = a[3];
  b[4] = a[4];
  b[5] = a[5];
  b[6] = a[6];
  b[7] = a[7];
  b[8] = a[8];
  b[9] = a[9];
  b[10] = a[10];
  b[11] = a[11];
  b[12] = a[12];
  b[13] = a[13];
  b[14] = a[14];
  b[15] = a[15];
};

snabbtjs.Matrix = function() {
  this.data = new Float32Array(16);
  this.a = new Float32Array(16);
  this.b = new Float32Array(16);
  snabbtjs.assignIdentity(this.data);
};

snabbtjs.Matrix.prototype.clear = function() {
  snabbtjs.assignIdentity(this.data);
};

snabbtjs.Matrix.prototype.translate = function(x, y, z) {
  snabbtjs.copyArray(this.data, this.a);
  snabbtjs.assignTranslate(this.b, x, y, z);
  snabbtjs.assignedMatrixMultiplication(this.a, this.b, this.data);
  return this;
};

snabbtjs.Matrix.prototype.rotateX = function(radians) {
  snabbtjs.copyArray(this.data, this.a);
  snabbtjs.assignRotateX(this.b, radians);
  snabbtjs.assignedMatrixMultiplication(this.a, this.b, this.data);
  return this;
};

snabbtjs.Matrix.prototype.rotateY = function(radians) {
  snabbtjs.copyArray(this.data, this.a);
  snabbtjs.assignRotateY(this.b, radians);
  snabbtjs.assignedMatrixMultiplication(this.a, this.b, this.data);
  return this;
};

snabbtjs.Matrix.prototype.rotateZ = function(radians) {
  snabbtjs.copyArray(this.data, this.a);
  snabbtjs.assignRotateZ(this.b, radians);
  snabbtjs.assignedMatrixMultiplication(this.a, this.b, this.data);
  return this;
};

snabbtjs.Matrix.prototype.scale = function(x, y) {
  snabbtjs.copyArray(this.data, this.a);
  snabbtjs.assignScale(this.b, x, y);
  snabbtjs.assignedMatrixMultiplication(this.a, this.b, this.data);
  return this;
};

snabbtjs.Matrix.prototype.skew = function(ax, ay) {
  snabbtjs.copyArray(this.data, this.a);
  snabbtjs.assignSkew(this.b, ax, ay);
  snabbtjs.assignedMatrixMultiplication(this.a, this.b, this.data);
  return this;
};

snabbtjs.assignedMatrixMultiplication = function(a, b, res) {
  // Unrolled loop
  res[0] = a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12];
  res[1] = a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13];
  res[2] = a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14];
  res[3] = a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15];

  res[4] = a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12];
  res[5] = a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13];
  res[6] = a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14];
  res[7] = a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15];

  res[8] = a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12];
  res[9] = a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13];
  res[10] = a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14];
  res[11] = a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15];

  res[12] = a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12];
  res[13] = a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13];
  res[14] = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14];
  res[15] = a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15];

  return res;
};

snabbtjs.matrixToCSS = function(matrix) {
  var css = 'matrix3d(';
  for(var i=0;i<15;++i) {
    if(Math.abs(matrix[i]) < 0.0001)
      css += '0,';
    else
      css += matrix[i].toFixed(10) + ',';
  }
  if(Math.abs(matrix[15]) < 0.0001)
    css += '0)';
  else
    css += matrix[15].toFixed(10) + ')';
  return css;
};

snabbtjs.setCSS = function(el, matrix) {
  el.style.webkitTransform = snabbtjs.matrixToCSS(matrix);
  el.style.transform = snabbtjs.matrixTCSS(matrix);
};
;snabbtjs.State = function(config) {
  var optionOrDefault = snabbtjs.optionOrDefault;
  this.ax = optionOrDefault(config.ax, 0);
  this.ay = optionOrDefault(config.ay, 0);
  this.az = optionOrDefault(config.az, 0);
  this.x = optionOrDefault(config.x, 0);
  this.y = optionOrDefault(config.y, 0);
  this.z = optionOrDefault(config.z, 0);
  this.bx = optionOrDefault(config.bx, 0);
  this.by = optionOrDefault(config.by, 0);
  this.bz = optionOrDefault(config.bz, 0);
  this.skewX = optionOrDefault(config.skewX, 0);
  this.skewY = optionOrDefault(config.skewY, 0);
  this.offsetX = optionOrDefault(config.offsetX, 0);
  this.offsetY = optionOrDefault(config.offsetY, 0);
  this.offsetZ = optionOrDefault(config.offsetZ, 0);
  this.sx = optionOrDefault(config.sx, 1);
  this.sy = optionOrDefault(config.sy, 1);
  this.width = config.width;
  this.height = config.height;
  this.opacity = optionOrDefault(config.opacity, 1);
};

snabbtjs.State.prototype.clone = function() {
  var p = new snabbtjs.State({
    ax: this.ax,
    ay: this.ay,
    az: this.az,
    x: this.x,
    y: this.y,
    z: this.z,
    bx: this.bx,
    by: this.by,
    bz: this.bz,
    skewX: this.skewX,
    skewY: this.skewY,
    sx: this.sx,
    sy: this.sy,
    height: this.height,
    width: this.width,
    opacity: this.opacity
  });
  return p;
};

snabbtjs.State.prototype.asMatrix = function() {
  var m = new snabbtjs.Matrix();

  m.translate(this.offsetX, this.offsetY, this.offsetZ);

  m.scale(this.sx, this.sy);
  m.skew(this.skewX, this.skewY);
  m.rotateX(this.ax);
  m.rotateY(this.ay);
  m.rotateZ(this.az);
  m.translate(this.x, this.y, this.z);
  m.rotateX(this.bx);
  m.rotateY(this.by);
  m.rotateZ(this.bz);
  return m.data;
};

snabbtjs.State.prototype.properties = function() {
  return {
    opacity: this.opacity,
    width: this.width + 'px',
    height: this.height + 'px'
  };
};
;var snabbtjs = snabbtjs || {};

snabbtjs.TweenStates = function(start, end, result, tweenValue) {
  var dx = (end.x - start.x);
  var dy = (end.y - start.y);
  var dz = (end.z - start.z);
  var dax = (end.ax - start.ax);
  var day = (end.ay - start.ay);
  var daz = (end.az - start.az);
  var dbx = (end.bx - start.bx);
  var dby = (end.by - start.by);
  var dbz = (end.bz - start.bz);
  var dsx = (end.sx - start.sx);
  var dsy = (end.sy - start.sy);
  var dskewx = (end.skewX - start.skewX);
  var dskewy = (end.skewY - start.skewY);
  var dwidth = (end.width - start.width);
  var dheight = (end.height - start.height);
  var dopacity = (end.opacity - start.opacity);

  result.ax = start.ax + tweenValue*dax;
  result.ay = start.ay + tweenValue*day;
  result.az = start.az + tweenValue*daz;
  result.x = start.x + tweenValue*dx;
  result.y = start.y + tweenValue*dy;
  result.z = start.z + tweenValue*dz;
  result.bx = start.bx + tweenValue*dbx;
  result.by = start.by + tweenValue*dby;
  result.bz = start.bz + tweenValue*dbz;
  result.skewX = start.skewX + tweenValue*dskewx;
  result.skewY = start.skewY + tweenValue*dskewy;
  result.sx = start.sx + tweenValue*dsx;
  result.sy = start.sy + tweenValue*dsy;

  if(end.width !== undefined)
    result.width = start.width + tweenValue*dwidth;
  if(end.height !== undefined)
    result.height = start.height + tweenValue*dheight;
  if(end.opacity !== undefined)
    result.opacity = start.opacity + tweenValue*dopacity;
};
;var snabbtjs = snabbtjs || {};

snabbtjs.optionOrDefault = function(option, def) {
  if(typeof option == 'undefined') {
    return def;
  }
  return option;
};

snabbtjs.updateElementTransform = function(element, matrix, perspective) {
  var cssPerspective = '';
  if(perspective) {
    cssPerspective = 'perspective(' + perspective + 'px) ';
  }
  element.style.webkitTransform = cssPerspective + snabbtjs.matrixToCSS(matrix);
  element.style.transform = cssPerspective + snabbtjs.matrixToCSS(matrix);
};

snabbtjs.updateElementProperties = function(element, properties) {
  for(var key in properties) {
    element.style[key] = properties[key];
  }
};

snabbtjs.isFunction = function(object) {
  return (typeof object === "function");
};
;
  // Your actual module
  return snabbtjs;
}));
