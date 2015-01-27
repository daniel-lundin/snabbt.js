var snabbtjs = snabbtjs || {};

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

  // Manual
  this.manual = options.manual;
  this.value = 0;
};

snabbtjs.Animation.prototype.stop = function() {
  this._stopped = true;
};

snabbtjs.Animation.prototype.stopped = function() {
  return this._stopped;
};

snabbtjs.Animation.prototype.finish = function(callback) {
  this.manual = false;
  var duration = this.duration * this.value;
  this.startTime = this.currentTime - duration;
  this.manualCallback = callback;
};

snabbtjs.Animation.prototype.rollback = function(callback) {
  this.manual = false;
  var duration = this.duration * (1 - this.value);
  this.startTime = this.currentTime - duration;
  var oldStart = this._startState;
  this._startState = this._endState;
  this._endState = oldStart;
  this.manualCallback = callback;
};

snabbtjs.Animation.prototype.restart = function() {
  // Restart timer
  this.startTime = undefined;
};

snabbtjs.Animation.prototype.tick = function(time) {
  if(this.manual) {
    this.currentTime = time;
    this.easing.tick(this.value);
    this.updateCurrentTransform();
    return;
  }

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

snabbtjs.Animation.prototype.setValue = function(value) {
  this.value = value;
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
  this.options = options;
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

snabbtjs.AttentionAnimation.prototype.restart = function() {
  // Restart spring
  this.spring = new snabbtjs.SpringEasing(this.options);
};

// Returns animation constructors based on options
snabbtjs.createAnimation = function(options) {
  if(options.valueFeeder)
    return new snabbtjs.ValueFeededAnimation(options);
  return new snabbtjs.Animation(options);
};
