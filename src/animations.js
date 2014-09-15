var snabbtjs = snabbtjs || {};

snabbtjs.AnimationType = {};
snabbtjs.AnimationType.TIME = 1;
snabbtjs.AnimationType.MANUAL = 2;
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
  } else {
    return false;
  }
};

snabbtjs.Animation.prototype.start_state = function() {
  return this._start_state;
};

snabbtjs.Animation.prototype.end_state = function() {
  if(this.mode == snabbtjs.AnimationType.TIME) {
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
  } else {
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
  this.position = 0;
  this.velocity = 1;
  this.mass = 1;
  this.stiffness = options.stiffness || 0.8;
  this.deacceleration = options.deacceleration || 0.9;

  this.equilibrium = false;
};

snabbtjs.AttentionAnimation.prototype.tick = function(time) {
  if(this.equilibrium)
    return;
  var spring_force = -this.position * this.stiffness;
  // f = m * a
  // a = f / m
  var a = spring_force / this.mass;
  // s = v * t
  // t = 1 ( for now )
  this.velocity += a;
  this.position += this.velocity;

  // Deacceleartion
  this.position *= this.deacceleration;

  if(Math.abs(this.position) < 0.01 && Math.abs(this.velocity) < 0.01)
    this.equilibrium = true;
  this.update_movement();
};

snabbtjs.AttentionAnimation.prototype.update_movement = function() {
  this.current_movement.x = this.movement.x * this.position;
  this.current_movement.y = this.movement.y * this.position;
  this.current_movement.z = this.movement.z * this.position;
  this.current_movement.ax = this.movement.ax * this.position;
  this.current_movement.ay = this.movement.ay * this.position;
  this.current_movement.az = this.movement.az * this.position;
}

snabbtjs.AttentionAnimation.prototype.current_state = function() {
  return this.current_movement;
}

snabbtjs.AttentionAnimation.prototype.completed = function() {
  return this.equilibrium;
}
