(function (root, factory) {
  var snabbt = factory();

  if (typeof exports === 'object') {
    // CommonJS
    module.exports = snabbt;
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define([], function () {
      return (root.returnExportsGlobal = snabbt);
    });
  } else {
    // As global variable
    root.snabbt = snabbt;
  }
}(this, function () {

  var tickRequests = [];
  var runningAnimations = [];
  var completedAnimations = [];

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

  var preprocessOptions = function(options, index, len) {
    if(!options)
      return options;
    var clone = cloneObject(options);
    if(isFunction(options.delay)) {
      clone.delay = options.delay(index, len);
    }
    if(isFunction(options.callback)) {
      console.log('DeprecationWarning: callback is renamed to complete');
      clone.complete = function() {
        options.callback(index, len);
      };
    }
    if(isFunction(options.complete)) {
      clone.complete = function() {
        options.complete(index, len);
      };
    }
    if(isFunction(options.valueFeeder)) {
      clone.valueFeeder = function(i, matrix) {
        return options.valueFeeder(i, matrix, index, len);
      };
    }
    if(isFunction(options.easing)) {
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
      if(isFunction(options[property])) {
        clone[property] = options[property](index, len);
      }
    });

    return clone;
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

    animation.updateElement(element);
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
          options.complete(element);
        }

        // Start next animation in queue
        if(queue.length) {
          options = queue.pop();

          start = stateFromOptions(options, end, true);
          end = stateFromOptions(options, cloneObject(end));
          options = setupAnimationOptions(start, end, options);

          animation = new Animation(options);
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
    var movement = stateFromOptions(options);
    options.movement = movement;
    var animation = new AttentionAnimation(options);

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

  /**
   * Parses an animation configuration object and returns a State instance
   */
  var stateFromOptions = function(options, state, useFromPrefix) {
    if (!state)
      state = new State({});
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

  var setupAnimationOptions = function(start, end, options) {
    options.startState = start;
    options.endState = end;
    return options;
  };

  var queueTick = function(func) {
    if(tickRequests.length === 0)
      window.requestAnimationFrame(tickAnimations);
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
      window.requestAnimationFrame(tickAnimations);
  };


  // Class for handling animation between two states
  var Animation = function(options) {
    this.startState = options.startState;
    this.endState = options.endState;
    this.duration = optionOrDefault(options.duration, 500);
    this.delay = optionOrDefault(options.delay, 0);
    this.perspective = options.perspective;
    this.easing = createEaser(optionOrDefault(options.easing, 'linear'), options);
    this.currentState = this.startState.clone();
    this.transformOrigin = options.transformOrigin;
    this.currentState.transformOrigin = options.transformOrigin;

    this.startTime = 0;
    this.currentTime = 0;
    this.stopped = false;

    // Manual related
    this.manual = options.manual;
    this.manualValue = 0;
    this.manualDelayFactor = this.delay / this.duration;

    // Setup tweener
    if(options.valueFeeder) {
      this.tweener = new ValueFeederTweener(options.valueFeeder,
                                                     this.startState,
                                                     this.endState,
                                                     this.currentState);
    } else {
      this.tweener = new StateTweener(this.startState, this.endState, this.currentState);
    }
  };

  Animation.prototype.stop = function() {
    this.stopped = true;
  };

  Animation.prototype.isStopped = function() {
    return this.stopped;
  };

  Animation.prototype.finish = function(callback) {
    this.manual = false;
    var duration = this.duration * this.manualValue;
    this.startTime = this.currentTime - duration;
    this.manualCallback = callback;
    this.easing.resetFrom = this.manualValue;
  };

  Animation.prototype.rollback = function(callback) {
    this.manual = false;
    this.tweener.setReverse();
    var duration = this.duration * (1 - this.manualValue);
    this.startTime = this.currentTime - duration;
    this.manualCallback = callback;
    this.easing.resetFrom = this.manualValue;
  };

  Animation.prototype.restart = function() {
    // Restart timer
    this.startTime = undefined;
    this.easing.resetFrom(0);
  };

  Animation.prototype.tick = function(time) {
    if(this.stopped)
      return;
    if(this.manual) {

      this.currentTime = time;
      this.updateCurrentTransform();
      return;
    }

    // If first tick, set start_time
    if(!this.startTime) {
      this.startTime = time;
    }
    if(time - this.startTime > this.delay)
      this.currentTime = time - this.delay;

    var curr = Math.min(Math.max(0.0, this.currentTime - this.startTime), this.duration);
    this.easing.tick(curr/this.duration);
    this.updateCurrentTransform();
    if(this.completed() && this.manualCallback) {
      this.manualCallback();
    }
  };

  Animation.prototype.getCurrentState = function() {
    return this.currentState;
  };

  Animation.prototype.setValue = function(manualValue) {
    this.manualValue = Math.min(Math.max(manualValue, 0.0001), 1 + this.manualDelayFactor);
  };

  Animation.prototype.updateCurrentTransform = function() {
    var tweenValue = this.easing.value();
    if(this.manual)
      tweenValue = Math.max(0.00001, this.manualValue - this.manualDelayFactor);
    this.tweener.tween(tweenValue);
  };

  Animation.prototype.completed = function() {
    if(this.stopped)
      return true;
    if(this.startTime === 0) {
      return false;
    }
    return this.easing.completed();
  };

  Animation.prototype.updateElement = function(element) {
    var matrix = this.tweener.asMatrix();
    var properties = this.tweener.getProperties();
    updateElementTransform(element, matrix, this.perspective);
    updateElementProperties(element, properties);
  };

  // ------------------------------
  // End Time animation
  // ------------------------------

  // ------------------------
  // -- AttentionAnimation --
  // ------------------------

  var AttentionAnimation = function(options) {
    this.movement = options.movement;
    this.currentMovement = new State({});
    options.initialVelocity = 0.1;
    options.equilibriumPosition = 0;
    this.spring = new SpringEasing(options);
    this.stopped = false;
    this.options = options;
  };

  AttentionAnimation.prototype.stop = function() {
    this.stopped = true;
  };

  AttentionAnimation.prototype.isStopped = function(time) {
    return this.stopped;
  };

  AttentionAnimation.prototype.tick = function(time) {
    if(this.stopped)
      return;
    if(this.spring.equilibrium)
      return;
    this.spring.tick();

    this.updateMovement();
  };

  AttentionAnimation.prototype.updateMovement = function() {
    var currentMovement = this.currentMovement;
    var movement = this.movement;
    var position = this.spring.position;
    currentMovement.position[0] = movement.position[0] * position;
    currentMovement.position[1] = movement.position[1] * position;
    currentMovement.position[2] = movement.position[2] * position;
    currentMovement.rotation[0] = movement.rotation[0] * position;
    currentMovement.rotation[1] = movement.rotation[1] * position;
    currentMovement.rotation[2] = movement.rotation[2] * position;
    currentMovement.rotationPost[0] = movement.rotationPost[0] * position;
    currentMovement.rotationPost[1] = movement.rotationPost[1] * position;
    currentMovement.rotationPost[2] = movement.rotationPost[2] * position;
    if(movement.scale[0] !== 1 && movement.scale[1] !== 1) {
      currentMovement.scale[0] = 1 + movement.scale[0] * position;
      currentMovement.scale[1] = 1 + movement.scale[1] * position;
    }

    currentMovement.skew[0] = movement.skew[0] * position;
    currentMovement.skew[1] = movement.skew[1] * position;
  };

  AttentionAnimation.prototype.updateElement = function(element) {
    updateElementTransform(element, this.currentMovement.asMatrix());
    updateElementProperties(element, this.currentMovement.getProperties());
  };

  AttentionAnimation.prototype.getCurrentState = function() {
    return this.currentMovement;
  };

  AttentionAnimation.prototype.completed = function() {
    return this.spring.equilibrium || this.stopped;
  };

  AttentionAnimation.prototype.restart = function() {
    // Restart spring
    this.spring = new SpringEasing(this.options);
  };

  // Returns animation constructors based on options
  var createAnimation = function(options) {
    return new Animation(options);
  };


  /**********
  * Easings *
  ***********/

  var linearEasing = function(value) {
    return value;
  };

  var ease = function(value) {
    return (Math.cos(value*Math.PI + Math.PI) + 1)/2;
  };

  var easeIn = function(value) {
    return value*value;
  };

  var easeOut = function(value) {
    return -Math.pow(value - 1, 2) + 1;
  };

  var SpringEasing = function(options) {
    this.position = optionOrDefault(options.startPosition, 0);
    this.equilibriumPosition = optionOrDefault(options.equilibriumPosition, 1);
    this.velocity = optionOrDefault(options.initialVelocity, 0);
    this.springConstant = optionOrDefault(options.springConstant, 0.8);
    this.deceleration = optionOrDefault(options.springDeceleration, 0.9);
    this.mass = optionOrDefault(options.springMass, 10);

    this.equilibrium = false;
  };

  SpringEasing.prototype.tick = function(value) {
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

  SpringEasing.prototype.resetFrom = function(value) {
    this.position = value;
    this.velocity = 0;
  };


  SpringEasing.prototype.value = function() {
    if(this.equilibrium)
      return this.equilibriumPosition;
    return this.position;
  };

  SpringEasing.prototype.completed = function() {
    return this.equilibrium;
  };

  var EASING_FUNCS = {
    'linear': linearEasing,
    'ease': ease,
    'easeIn': easeIn,
    'easeOut': easeOut,
  };

  var Easer = function(easer) {
    this.easer = easer;
    this._value = 0;
  };

  Easer.prototype.tick = function(value) {
    this._value = this.easer(value);
    this.lastValue = value;
  };

  Easer.prototype.resetFrom = function(value) {
    this.lastValue = 0;
  };

  Easer.prototype.value = function() {
    return this._value;
  };

  Easer.prototype.completed = function() {
    if(this.lastValue >= 1) {
      return this.lastValue;
    }
    return false;
  };

  var createEaser = function(easerName, options) {
    if(easerName == 'spring') {
      return new SpringEasing(options);
    }
    var easeFunction = easerName;
    if(!isFunction(easerName)) {
      easeFunction = EASING_FUNCS[easerName];
    }
    return new Easer(easeFunction);
  };

  /***
   * Matrix related
   */

  var assignTranslate = function(matrix, x, y, z) {
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

  var assignRotateX = function(matrix, rad) {
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


  var assignRotateY = function(matrix, rad) {
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

  var assignRotateZ = function(matrix, rad) {
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

  var assignSkew = function(matrix, ax, ay) {
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


  var assignScale = function(matrix, x, y) {
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

  var assignIdentity = function(matrix) {
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

  var copyArray = function(a, b) {
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

  var Matrix = function() {
    this.data = new Float32Array(16);
    this.a = new Float32Array(16);
    this.b = new Float32Array(16);
    assignIdentity(this.data);
  };

  Matrix.prototype.asCSS = function() {
    var css = 'matrix3d(';
    for(var i=0;i<15;++i) {
      if(Math.abs(this.data[i]) < 0.0001)
        css += '0,';
      else
        css += this.data[i].toFixed(10) + ',';
    }
    if(Math.abs(this.data[15]) < 0.0001)
      css += '0)';
    else
      css += this.data[15].toFixed(10) + ')';
    return css;
  };

  Matrix.prototype.clear = function() {
    assignIdentity(this.data);
  };

  Matrix.prototype.translate = function(x, y, z) {
    copyArray(this.data, this.a);
    assignTranslate(this.b, x, y, z);
    assignedMatrixMultiplication(this.a, this.b, this.data);
    return this;
  };

  Matrix.prototype.rotateX = function(radians) {
    copyArray(this.data, this.a);
    assignRotateX(this.b, radians);
    assignedMatrixMultiplication(this.a, this.b, this.data);
    return this;
  };

  Matrix.prototype.rotateY = function(radians) {
    copyArray(this.data, this.a);
    assignRotateY(this.b, radians);
    assignedMatrixMultiplication(this.a, this.b, this.data);
    return this;
  };

  Matrix.prototype.rotateZ = function(radians) {
    copyArray(this.data, this.a);
    assignRotateZ(this.b, radians);
    assignedMatrixMultiplication(this.a, this.b, this.data);
    return this;
  };

  Matrix.prototype.scale = function(x, y) {
    copyArray(this.data, this.a);
    assignScale(this.b, x, y);
    assignedMatrixMultiplication(this.a, this.b, this.data);
    return this;
  };

  Matrix.prototype.skew = function(ax, ay) {
    copyArray(this.data, this.a);
    assignSkew(this.b, ax, ay);
    assignedMatrixMultiplication(this.a, this.b, this.data);
    return this;
  };

  var assignedMatrixMultiplication = function(a, b, res) {
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

  var State = function(config) {
    this.position = optionOrDefault(config.position, [0, 0, 0]);
    this.rotation = optionOrDefault(config.rotation, [0, 0, 0]);
    this.rotationPost = optionOrDefault(config.rotationPost, [0, 0, 0]);
    this.skew = optionOrDefault(config.skew, [0, 0]);
    this.scale = optionOrDefault(config.scale, [1, 1]);
    this.opacity = config.opacity;
    this.width = config.width;
    this.height = config.height;

    // Caching of matrix and properties so we don't have to create new ones everytime they are needed
    this.matrix = new Matrix();
    this.properties = {
      opacity: undefined,
      width: undefined,
      height: undefined
    };
  };

  State.prototype.clone = function() {
    var p = new State({
      position: this.position.slice(0),
      rotation: this.rotation.slice(0),
      rotationPost: this.rotationPost.slice(0),
      skew: this.skew.slice(0),
      scale: this.scale.slice(0),
      height: this.height,
      width: this.width,
      opacity: this.opacity
    });
    return p;
  };

  State.prototype.asMatrix = function() {
    var m = this.matrix;
    m.clear();

    if(this.transformOrigin)
      m.translate(-this.transformOrigin[0], -this.transformOrigin[1], -this.transformOrigin[2]);

    if(this.scale[0] !== 1 || this.scale[1] !== 1) {
      m.scale(this.scale[0], this.scale[1]);
    }

    if(this.skew[0] !== 0 || this.skew[1] !== 0) {
      m.skew(this.skew[0], this.skew[1]);
    }

    if(this.rotation[0] !== 0 || this.rotation[1] !== 0 || this.rotation[2] !== 0) {
      m.rotateX(this.rotation[0]);
      m.rotateY(this.rotation[1]);
      m.rotateZ(this.rotation[2]);
    }

    if(this.position[0] !== 0 || this.position[1] !== 0 || this.position[2] !== 0) {
      m.translate(this.position[0], this.position[1], this.position[2]);
    }

    if(this.rotationPost[0] !== 0 || this.rotationPost[1] !== 0 || this.rotationPost[2] !== 0) {
      m.rotateX(this.rotationPost[0]);
      m.rotateY(this.rotationPost[1]);
      m.rotateZ(this.rotationPost[2]);
    }

    if(this.transformOrigin)
      m.translate(this.transformOrigin[0], this.transformOrigin[1], this.transformOrigin[2]);
    return m;
  };

  State.prototype.getProperties = function() {
    this.properties.opacity = this.opacity;
    this.properties.width = this.width + 'px';
    this.properties.height = this.height + 'px';
    return this.properties;
  };

  // ------------------
  // -- StateTweener -- 
  // -------------------

  var StateTweener = function(startState, endState, resultState) {
    this.start = startState;
    this.end = endState;
    this.result = resultState;
  };

  StateTweener.prototype.tween = function(tweenValue) {
    var dX = (this.end.position[0] - this.start.position[0]);
    var dY = (this.end.position[1] - this.start.position[1]);
    var dZ = (this.end.position[2] - this.start.position[2]);
    var dAX = (this.end.rotation[0] - this.start.rotation[0]);
    var dAY = (this.end.rotation[1] - this.start.rotation[1]);
    var dAZ = (this.end.rotation[2] - this.start.rotation[2]);
    var dBX = (this.end.rotationPost[0] - this.start.rotationPost[0]);
    var dBY = (this.end.rotationPost[1] - this.start.rotationPost[1]);
    var dBZ = (this.end.rotationPost[2] - this.start.rotationPost[2]);
    var dSX = (this.end.scale[0] - this.start.scale[0]);
    var dSY = (this.end.scale[1] - this.start.scale[1]);
    var dSkewX = (this.end.skew[0] - this.start.skew[0]);
    var dSkewY = (this.end.skew[1] - this.start.skew[1]);
    var dWidth = (this.end.width - this.start.width);
    var dHeight = (this.end.height - this.start.height);
    var dOpacity = (this.end.opacity - this.start.opacity);

    this.result.position[0] = this.start.position[0] + tweenValue*dX;
    this.result.position[1] = this.start.position[1] + tweenValue*dY;
    this.result.position[2] = this.start.position[2] + tweenValue*dZ;
    this.result.rotation[0] = this.start.rotation[0] + tweenValue*dAX;
    this.result.rotation[1] = this.start.rotation[1] + tweenValue*dAY;
    this.result.rotation[2] = this.start.rotation[2] + tweenValue*dAZ;
    this.result.rotationPost[0] = this.start.rotationPost[0] + tweenValue*dBX;
    this.result.rotationPost[1] = this.start.rotationPost[1] + tweenValue*dBY;
    this.result.rotationPost[2] = this.start.rotationPost[2] + tweenValue*dBZ;
    this.result.skew[0] = this.start.skew[0] + tweenValue*dSkewX;
    this.result.skew[1] = this.start.skew[1] + tweenValue*dSkewY;
    this.result.scale[0] = this.start.scale[0] + tweenValue*dSX;
    this.result.scale[1] = this.start.scale[1] + tweenValue*dSY;

    if(this.end.width !== undefined)
      this.result.width = this.start.width + tweenValue*dWidth;
    if(this.end.height !== undefined)
      this.result.height = this.start.height + tweenValue*dHeight;
    if(this.end.opacity !== undefined)
      this.result.opacity = this.start.opacity + tweenValue*dOpacity;
  };

  StateTweener.prototype.asMatrix = function() {
    return this.result.asMatrix();
  };

  StateTweener.prototype.getProperties = function() {
    return this.result.getProperties();
  };

  StateTweener.prototype.setReverse = function() {
    var oldStart = this.start;
    this.start = this.end;
    this.end = oldStart;
  };

  // ------------------------
  // -- ValueFeederTweener -- 
  // ------------------------

  var ValueFeederTweener = function(valueFeeder, startState, endState, resultState) {
    this.currentMatrix = valueFeeder(0, new Matrix());
    this.valueFeeder = valueFeeder;
    this.start = startState;
    this.end = endState;
    this.result = resultState;
  };

  ValueFeederTweener.prototype.tween = function(tweenValue) {
    if(this.reverse)
      tweenValue = 1 - tweenValue;
    this.currentMatrix.clear();
    this.currentMatrix = this.valueFeeder(tweenValue, this.currentMatrix);

    var dWidth = (this.end.width - this.start.width);
    var dHeight = (this.end.height - this.start.height);
    var dOpacity = (this.end.opacity - this.start.opacity);

    if(this.end.width !== undefined)
      this.result.width = this.start.width + tweenValue*dWidth;
    if(this.end.height !== undefined)
      this.result.height = this.start.height + tweenValue*dHeight;
    if(this.end.opacity !== undefined)
      this.result.opacity = this.start.opacity + tweenValue*dOpacity;
  };

  ValueFeederTweener.prototype.asMatrix = function() {
    return this.currentMatrix;
  };

  ValueFeederTweener.prototype.getProperties = function() {
    return this.result.getProperties();
  };

  ValueFeederTweener.prototype.setReverse = function() {
    this.reverse = true;
  };

  var optionOrDefault = function(option, def) {
    if(typeof option == 'undefined') {
      return def;
    }
    return option;
  };

  var updateElementTransform = function(element, matrix, perspective) {
    var cssPerspective = '';
    if(perspective) {
      cssPerspective = 'perspective(' + perspective + 'px) ';
    }
    var cssMatrix = matrix.asCSS();
    element.style.webkitTransform = cssPerspective + cssMatrix;
    element.style.transform = cssPerspective + cssMatrix;
  };

  var updateElementProperties = function(element, properties) {
    for(var key in properties) {
      element.style[key] = properties[key];
    }
  };

  var isFunction = function(object) {
    return (typeof object === "function");
  };

  var cloneObject = function(object) {
    if(!object)
      return object;
    var clone = {};
    for(var key in object) {
      clone[key] = object[key];
    }
    return clone;
  };

  if(window.jQuery) {
    (function ( $ ) {
      $.fn.snabbt = function(arg1, arg2) {
        return snabbt(this.get(), arg1, arg2);
      };
    }( jQuery ));
  }

  snabbt.Matrix = Matrix;
  snabbt.setElementTransform = updateElementTransform;
  return snabbt;
}));
