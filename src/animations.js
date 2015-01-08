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
  if(options.offset) {
    this._currentState.offsetX = this.offset[0];
    this._currentState.offsetY = this.offset[1];
    this._currentState.offsetZ = this.offset[2];
    this._endState.offsetX = this.offset[0];
    this._endState.offsetY = this.offset[1];
    this._endState.offsetZ = this.offset[2];
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
  if(this._stopped)
    return;

  // If first tick, set start_time
  if(!this.startTime)
    this.startTime = time;
  if(time - this.startTime > this.delay)
    this.currentTime = time - this.delay;

  var curr = Math.min(Math.max(0.0, this.currentTime - this.startTime), this.duration);
  var max = this.duration;

  this.easing.tick(curr/max);
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

  var curr = Math.min(Math.max(0.001, this.currentTime - this.startTime), this.duration);
  var max = this.duration;
  this.easing.tick(curr/max);

  this.updateCurrentTransform();
};

snabbtjs.ValueFeededAnimation.prototype.currentState = function() {
  return this._currentState;
};

snabbtjs.ValueFeededAnimation.prototype.updateCurrentTransform = function() {
  var tweenValue = this.easing.value();
  this.currentMatrix.clear();
  this.currentMatrix = this.valueFeeder(tweenValue, this.currentMatrix);
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
  if(this._stopped)
    return;
  if(this.spring.equilibrium)
    return;
  this.spring.tick();

  this.updateMovement();
};

snabbtjs.AttentionAnimation.prototype.updateMovement = function() {
  this.currentMovement.x = this.movement.x * this.spring.position;
  this.currentMovement.y = this.movement.y * this.spring.position;
  this.currentMovement.z = this.movement.z * this.spring.position;
  this.currentMovement.ax = this.movement.ax * this.spring.position;
  this.currentMovement.ay = this.movement.ay * this.spring.position;
  this.currentMovement.az = this.movement.az * this.spring.position;
  this.currentMovement.bx = this.movement.bx * this.spring.position;
  this.currentMovement.by = this.movement.by * this.spring.position;
  this.currentMovement.bz = this.movement.bz * this.spring.position;
};

snabbtjs.AttentionAnimation.prototype.updateElement = function(element) {
  var matrix = this.currentMovement.asMatrix();
  var properties = this.currentMovement.properties();
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
