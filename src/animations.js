var snabbtjs = snabbtjs || {};

snabbtjs.AnimationType = {};
snabbtjs.AnimationType.TIME = 1;
snabbtjs.AnimationType.MANUAL = 2;
snabbtjs.AnimationType.SPRING = 3;

snabbtjs.Animation = function(options) {
  this.assign(options);
};

snabbtjs.Animation.prototype.assign = function(options) {
  this._start_state = options.start_state || new snabbtjs.State({});
  this._end_state = options.end_state || new snabbtjs.State({});
  this.offset = options.offset;
  this.duration = options.duration || 500;
  this.delay = options.delay || 0;
  this.easing = options.easing || snabbtjs.linear_easing;
  this.mode = options.mode || snabbtjs.AnimationType.TIME;

  this.start_time = 0;
  this.current_time = 0;
  // Manual related, should probably be subclassed
  this.value = 0;
  this.cancelled = false;

  if(this.mode === snabbtjs.AnimationType.SPRING) {
    options.equilibrium_position = 1;
    this.spring = new snabbtjs.SpringEasing(options);
  }

  this._current_state = new snabbtjs.State({});
  if(options.offset) {
    this._current_state.offset_x = this.offset[0];
    this._current_state.offset_y = this.offset[1];
    this._current_state.offset_z = this.offset[2];
    this._end_state.offset_x = this.offset[0];
    this._end_state.offset_y = this.offset[1];
    this._end_state.offset_z = this.offset[2];
  }
};

snabbtjs.Animation.prototype.tick = function(time) {
  // If first tick, set start_time
  if(this.mode == snabbtjs.AnimationType.TIME) {
    if(!this.start_time) {
      this.start_time = time;
    }
    if(time - this.start_time > this.delay)
      this.current_time = time - this.delay;
  } else if(this.mode == snabbtjs.AnimationType.SPRING) {
    this.spring.tick();
  }
};

snabbtjs.Animation.prototype.stop_manual = function(complete) {
  // Start a TIME based animation from current state
  // to end_state or start_state depending on complete
  if(!complete) {
    this._end_state.assign(this._start_state);
    this.delay = -this.delay;
  }
  this._start_state.assign(this._current_state);
  this.mode = snabbtjs.AnimationType.TIME;
};

snabbtjs.Animation.prototype.set_value = function(value) {
  var delay = this.delay / this.duration;
  this.value = Math.max(0, Math.min(value - delay, 1));
};

snabbtjs.Animation.prototype.current_state = function() {
  this.update_current_transition();
  return this._current_state;
};

snabbtjs.Animation.prototype.completed = function() {
  if(this.mode == snabbtjs.AnimationType.TIME) {
    if(this.start_time === 0) {
      return false;
    }
    return this.current_time - this.start_time > this.duration;
  } else if(this.mode == snabbtjs.AnimationType.SPRING) {
    return this.spring.equilibrium;
  } else {
    return false;
  }
};

snabbtjs.Animation.prototype.start_state = function() {
  return this._start_state;
};

snabbtjs.Animation.prototype.end_state = function() {
  if(this.mode == snabbtjs.AnimationType.TIME || this.mode == snabbtjs.AnimationType.SPRING) {
    return this._end_state;
  } else {
    return this.current_state();
  }
};

snabbtjs.Animation.prototype.update_current_transition = function() {
  var curr = 0;
  var max = 0;
  if(this.mode == snabbtjs.AnimationType.TIME) {
    curr = Math.min(Math.max(0.001, this.current_time - this.start_time), this.duration);
    max = this.duration;
  }
  if(this.mode == snabbtjs.AnimationType.SPRING) {
    curr = this.spring.position;
  }

  var dx = (this._end_state.x - this._start_state.x);
  var dy = (this._end_state.y - this._start_state.y);
  var dz = (this._end_state.z - this._start_state.z);
  var dax = (this._end_state.ax - this._start_state.ax);
  var day = (this._end_state.ay - this._start_state.ay);
  var daz = (this._end_state.az - this._start_state.az);
  var dbx = (this._end_state.bx - this._start_state.bx);
  var dby = (this._end_state.by - this._start_state.by);
  var dbz = (this._end_state.bz - this._start_state.bz);
  var dsx = (this._end_state.sx - this._start_state.sx);
  var dsy = (this._end_state.sy - this._start_state.sy);
  var dwidth = (this._end_state.width - this._start_state.width);
  var dheight = (this._end_state.height - this._start_state.height);
  var dopacity = (this._end_state.opacity - this._start_state.opacity);

  var s = 0;
  if(this.mode == snabbtjs.AnimationType.TIME) {
    s = this.easing(curr, max);
  } else if(this.mode == snabbtjs.AnimationType.SPRING) {
    s = curr;
  }else {
    s = this.value;
  }
  this._current_state.ax = this._start_state.ax + s*dax;
  this._current_state.ay = this._start_state.ay + s*day;
  this._current_state.az = this._start_state.az + s*daz;
  this._current_state.x = this._start_state.x + s*dx;
  this._current_state.y = this._start_state.y + s*dy;
  this._current_state.z = this._start_state.z + s*dz;
  this._current_state.bx = this._start_state.bx + s*dbx;
  this._current_state.by = this._start_state.by + s*dby;
  this._current_state.bz = this._start_state.bz + s*dbz;
  this._current_state.sx = this._start_state.sx + s*dsx;
  this._current_state.sy = this._start_state.sy + s*dsy;
  if(this._end_state.width !== undefined)
    this._current_state.width = this._start_state.width + s*dwidth;
  if(this._end_state.height !== undefined)
    this._current_state.height = this._start_state.height + s*dheight;
  if(this._end_state.opacity !== undefined)
    this._current_state.opacity = this._start_state.opacity + s*dopacity;
};


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
// -- AttantionAnimation --
// ------------------------

snabbtjs.AttentionAnimation = function(options) {
  this.movement = options.movement;
  this.current_movement = new snabbtjs.State({});
  options.initial_velocity = 0.1;
  this.spring = new snabbtjs.SpringEasing(options);
};

snabbtjs.AttentionAnimation.prototype.tick = function(time) {
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

snabbtjs.AttentionAnimation.prototype.current_state = function() {
  return this.current_movement;
};

snabbtjs.AttentionAnimation.prototype.completed = function() {
  return this.spring.equilibrium;
};
