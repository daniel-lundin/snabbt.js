var snabbtjs = snabbtjs || {};

// ------------------------------ 
// Time animation
// ------------------------------ 

snabbtjs.Animation = function(options) {
  this._start_state = options.start_state;
  this._end_state = options.end_state;
  this.offset = options.offset;
  this.duration = options.duration || 500;
  this.delay = options.delay || 0;
  this.easing = snabbtjs.create_easer('linear');
  this.perspective = options.perspective;
  if(options.easing)
    this.easing = snabbtjs.create_easer(options.easing, options);
  this._current_state = this._start_state.clone();
  if(options.offset) {
    this._current_state.offset_x = this.offset[0];
    this._current_state.offset_y = this.offset[1];
    this._current_state.offset_z = this.offset[2];
    this._end_state.offset_x = this.offset[0];
    this._end_state.offset_y = this.offset[1];
    this._end_state.offset_z = this.offset[2];
  }

  this.start_time = 0;
  this.current_time = 0;
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
  if(!this.start_time) 
    this.start_time = time;
  if(time - this.start_time > this.delay)
    this.current_time = time - this.delay;

  var curr = Math.min(Math.max(0.0, this.current_time - this.start_time), this.duration);
  //var curr = Math.max(this.current_time - this.start_time, this.duration);
  var max = this.duration;
  this.easing.tick(curr/max);
  this.update_current_transform();
};

snabbtjs.Animation.prototype.current_state = function() {
  return this._current_state;
};

snabbtjs.Animation.prototype.update_current_transform = function() {
  var tween_value = this.easing.value();
  snabbtjs.TweenStates(this._start_state, this._end_state, this._current_state, tween_value);
};

snabbtjs.Animation.prototype.completed = function() {
  if(this._stopped)
    return true;
  if(this.start_time === 0) {
    return false;
  }
  return this.easing.completed();
};

snabbtjs.Animation.prototype.update_element = function(element) {
  var matrix = this._current_state.as_matrix();
  var properties = this._current_state.properties();
  snabbtjs.update_element_transform(element, matrix, this.perspective);
  snabbtjs.update_element_properties(element, properties);
};

// ------------------------------ 
// End Time animation
// ------------------------------ 

// ------------------------------ 
// Value feeded animation
// ------------------------------ 

snabbtjs.ValueFeededAnimation = function(options) {
  this.value_feeder = options.value_feeder;
  this.duration = options.duration || 500;
  this.delay = options.delay || 0;
  this.perspective = options.perspective;

  this.easing = snabbtjs.create_easer('linear');
  if(options.easing)
    this.easing = snabbtjs.create_easer(options.easing, options);
  this._current_state = new snabbtjs.State({});
  this.current_matrix = this.value_feeder(0);

  this.start_time = 0;
  this.current_time = 0;
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
  if(!this.start_time) 
    this.start_time = time;
  if(time - this.start_time > this.delay)
    this.current_time = time - this.delay;

  var curr = Math.min(Math.max(0.001, this.current_time - this.start_time), this.duration);
  var max = this.duration;
  this.easing.tick(curr/max);

  this.update_current_transform();
};

snabbtjs.ValueFeededAnimation.prototype.current_state = function() {
  return this._current_state;
};

snabbtjs.ValueFeededAnimation.prototype.update_current_transform = function() {
  var tween_value = this.easing.value();
  this.current_matrix = this.value_feeder(tween_value);
};

snabbtjs.ValueFeededAnimation.prototype.completed = function() {
  if(this._stopped)
    return true;
  return this.easing.completed();
};

snabbtjs.ValueFeededAnimation.prototype.update_element = function(element) {
  snabbtjs.update_element_transform(element, this.current_matrix, this.perspective);
};

// ------------------------------ 
// End value feeded animation
// ------------------------------ 

// ---------------------- \\
// -- ScrollAnimation --  \\
// ---------------------- \\

snabbtjs.ScrollAnimation = function(options) {
  this.start_scroll = window.scrollY;
  this.end_scroll = options.scroll_pos;
  this.duration = options.duration || 500;
  this.delay = options.delay || 0;
  this.easing = options.easing || snabbtjs.cos_easing;

  this.start_time = 0;
  this.current_time = 0;
};

snabbtjs.ScrollAnimation.prototype.tick = function(time) {
  if(!this.start_time) {
    this.start_time = time;
  }
  if(time - this.start_time > this.delay)
    this.current_time = time - this.delay;
  this.update_scrolling();
};

snabbtjs.ScrollAnimation.prototype.update_scrolling = function(time) {
  var curr = Math.min(Math.max(0.001, this.current_time - this.start_time), this.duration);
  var max = this.duration;
  var s = this.easing(curr, max);
  var scroll_diff = this.end_scroll - this.start_scroll;
  var current_scroll = this.start_scroll + s * scroll_diff;

  window.scrollTo(0, current_scroll);
};

snabbtjs.ScrollAnimation.prototype.completed = function() {
  if(this.start_time === 0) {
    return false;
  }
  return this.current_time - this.start_time > this.duration;
};

// ------------------------
// -- AttentionAnimation --
// ------------------------

snabbtjs.AttentionAnimation = function(options) {
  this.movement = options.movement;
  this.current_movement = new snabbtjs.State({});
  options.initial_velocity = 0.1;
  options.equilibrium_position = 0;
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

  this.update_movement();
};

snabbtjs.AttentionAnimation.prototype.update_movement = function() {
  this.current_movement.x = this.movement.x * this.spring.position;
  this.current_movement.y = this.movement.y * this.spring.position;
  this.current_movement.z = this.movement.z * this.spring.position;
  this.current_movement.ax = this.movement.ax * this.spring.position;
  this.current_movement.ay = this.movement.ay * this.spring.position;
  this.current_movement.az = this.movement.az * this.spring.position;
  this.current_movement.bx = this.movement.bx * this.spring.position;
  this.current_movement.by = this.movement.by * this.spring.position;
  this.current_movement.bz = this.movement.bz * this.spring.position;
};

snabbtjs.AttentionAnimation.prototype.update_element = function(element) {
  var matrix = this.current_movement.as_matrix();
  var properties = this.current_movement.properties();
  snabbtjs.update_element_transform(element, matrix);
  snabbtjs.update_element_properties(element, properties);
};

snabbtjs.AttentionAnimation.prototype.current_state = function() {
  return this.current_movement;
};

snabbtjs.AttentionAnimation.prototype.completed = function() {
  return this.spring.equilibrium || this._stopped;
};


// Returns animation constructors based on options
snabbtjs.create_animation = function(options) {
  if(options.value_feeder)
    return new snabbtjs.ValueFeededAnimation(options);
  return new snabbtjs.Animation(options);
};
