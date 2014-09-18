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
;// Steppers

var snabbtjs = snabbtjs || {};


snabbtjs.pow2_easing = function(curr, max) {
  var t = curr/max;
  return t*t;
};

snabbtjs.linear_easing = function(curr, max) {
  return curr/max;
};

snabbtjs.cos_easing = function(curr, max) {
  return (Math.cos((curr/max)*Math.PI + Math.PI) + 1)/2;
};

snabbtjs.create_cubic_bezier_easing = function(p0x, p0y, p1x, p1y) {
  return function(curr, max) {
    var t = curr/max;
    return 3*Math.pow(1-t, 2)*t*(p0x + p0y) + 3*(1-t)*Math.pow(t, 2)*(p1x + p1y) + Math.pow(t, 3);
    //return 3*Math.pow(1-t, 2)*t*(p0y) + 3*(1-t)*Math.pow(t, 2)*(p1y) + Math.pow(t, 3);
  };
};

snabbtjs.cubic_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(2*t - 1, 3)+1)/2;
};

snabbtjs.sqrt_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(t, 0.5));
};

snabbtjs.cos_wooble_easing = function (curr, max) {
  var t = curr/max;
  return t*Math.cos(4*Math.PI*t);
};

snabbtjs.atan_easing = function (curr, max) {
  var t = curr/max;
  return (Math.atan(Math.PI*t - Math.PI/2) + 1)/2;
};

snabbtjs.sinc_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 5;
  return (-Math.sin(k*Math.PI*t)/(k*t) + Math.PI)/Math.PI;
};

snabbtjs.sinc2_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 4*Math.PI*Math.pow(t, 2);
  return (1 - Math.sin(k)/k);
};

snabbtjs.sinc2 = function(curr, max) {
  var t = curr/max;
  return 1 - Math.sin(20*Math.PI*t)/(20*Math.PI*t);
};

snabbtjs.superman_easing = function(curr, max) {
  var t = curr/max;
  var x = 10*Math.PI*(t-0.5);
  return t + 0.1*(Math.sin(x)/x);
};

snabbtjs.sinc = function(curr, max) {
  var t = curr/max;
  var x = 20*Math.PI*(t);
  return (Math.sin(x)/x);
};



snabbtjs.SpringEasing = function(options) {
  console.log(options);
  this.position = snabbtjs.option_or_default(options.start_position, 0);
  this.equilibrium_position = snabbtjs.option_or_default(options.equilibrium_position, 0);
  this.velocity = snabbtjs.option_or_default(options.initial_velocity, 0);
  this.spring_constant = snabbtjs.option_or_default(options.spring_constant, 0.8);
  this.deacceleration = snabbtjs.option_or_default(options.deacceleration, 0.9);
  this.mass = 10;

  this.equilibrium = false;
};

snabbtjs.SpringEasing.prototype.tick = function() {
  if(this.equilibrium)
    return;
  var spring_force = -(this.position - this.equilibrium_position) * this.spring_constant;
  //spring_force *= Math.abs(spring_force);
  // f = m * a
  // a = f / m
  var a = spring_force / this.mass;
  // s = v * t
  // t = 1 ( for now )
  this.velocity += a;
  this.position += this.velocity;

  // Deacceleartion
  this.velocity *= this.deacceleration;

  if(Math.abs(this.position - this.equilibrium_position) < 0.001 && Math.abs(this.velocity) < 0.001) {
    this.equilibrium = true;
  }
};

snabbtjs.EASING_FUNCS = {
  'linear': snabbtjs.linear_easing,
  'cubic': snabbtjs.cubic_easing,
  'square': snabbtjs.pow2_easing,
  'sqrt': snabbtjs.sqrt_easing,
  'atan': snabbtjs.atan_easing,
  'cos': snabbtjs.cos_easing,
  'sinc_wobbler': snabbtjs.sinc_wobbler_easing,
  'sinc2_wobbler': snabbtjs.sinc2_wobbler_easing,
  'superman': snabbtjs.superman_easing,
  'sinc': snabbtjs.sinc,
};
;var snabbtjs = snabbtjs || {};

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
;// Steppers

var snabbtjs = snabbtjs || {};


snabbtjs.pow2_easing = function(curr, max) {
  var t = curr/max;
  return t*t;
};

snabbtjs.linear_easing = function(curr, max) {
  return curr/max;
};

snabbtjs.cos_easing = function(curr, max) {
  return (Math.cos((curr/max)*Math.PI + Math.PI) + 1)/2;
};

snabbtjs.create_cubic_bezier_easing = function(p0x, p0y, p1x, p1y) {
  return function(curr, max) {
    var t = curr/max;
    return 3*Math.pow(1-t, 2)*t*(p0x + p0y) + 3*(1-t)*Math.pow(t, 2)*(p1x + p1y) + Math.pow(t, 3);
    //return 3*Math.pow(1-t, 2)*t*(p0y) + 3*(1-t)*Math.pow(t, 2)*(p1y) + Math.pow(t, 3);
  };
};

snabbtjs.cubic_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(2*t - 1, 3)+1)/2;
};

snabbtjs.sqrt_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(t, 0.5));
};

snabbtjs.cos_wooble_easing = function (curr, max) {
  var t = curr/max;
  return t*Math.cos(4*Math.PI*t);
};

snabbtjs.atan_easing = function (curr, max) {
  var t = curr/max;
  return (Math.atan(Math.PI*t - Math.PI/2) + 1)/2;
};

snabbtjs.sinc_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 5;
  return (-Math.sin(k*Math.PI*t)/(k*t) + Math.PI)/Math.PI;
};

snabbtjs.sinc2_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 4*Math.PI*Math.pow(t, 2);
  return (1 - Math.sin(k)/k);
};

snabbtjs.sinc2 = function(curr, max) {
  var t = curr/max;
  return 1 - Math.sin(20*Math.PI*t)/(20*Math.PI*t);
};

snabbtjs.superman_easing = function(curr, max) {
  var t = curr/max;
  var x = 10*Math.PI*(t-0.5);
  return t + 0.1*(Math.sin(x)/x);
};

snabbtjs.sinc = function(curr, max) {
  var t = curr/max;
  var x = 20*Math.PI*(t);
  return (Math.sin(x)/x);
};



snabbtjs.SpringEasing = function(options) {
  console.log(options);
  this.position = snabbtjs.option_or_default(options.start_position, 0);
  this.equilibrium_position = snabbtjs.option_or_default(options.equilibrium_position, 0);
  this.velocity = snabbtjs.option_or_default(options.initial_velocity, 0);
  this.spring_constant = snabbtjs.option_or_default(options.spring_constant, 0.8);
  this.deacceleration = snabbtjs.option_or_default(options.deacceleration, 0.9);
  this.mass = 10;

  this.equilibrium = false;
};

snabbtjs.SpringEasing.prototype.tick = function() {
  if(this.equilibrium)
    return;
  var spring_force = -(this.position - this.equilibrium_position) * this.spring_constant;
  //spring_force *= Math.abs(spring_force);
  // f = m * a
  // a = f / m
  var a = spring_force / this.mass;
  // s = v * t
  // t = 1 ( for now )
  this.velocity += a;
  this.position += this.velocity;

  // Deacceleartion
  this.velocity *= this.deacceleration;

  if(Math.abs(this.position - this.equilibrium_position) < 0.001 && Math.abs(this.velocity) < 0.001) {
    this.equilibrium = true;
  }
};

snabbtjs.EASING_FUNCS = {
  'linear': snabbtjs.linear_easing,
  'cubic': snabbtjs.cubic_easing,
  'square': snabbtjs.pow2_easing,
  'sqrt': snabbtjs.sqrt_easing,
  'atan': snabbtjs.atan_easing,
  'cos': snabbtjs.cos_easing,
  'sinc_wobbler': snabbtjs.sinc_wobbler_easing,
  'sinc2_wobbler': snabbtjs.sinc2_wobbler_easing,
  'superman': snabbtjs.superman_easing,
  'sinc': snabbtjs.sinc,
};
;var snabbtjs = snabbtjs || {};

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
  this.velocity = options.initial_velocity || 1;
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
;// Steppers

var snabbtjs = snabbtjs || {};


snabbtjs.pow2_easing = function(curr, max) {
  var t = curr/max;
  return t*t;
};

snabbtjs.linear_easing = function(curr, max) {
  return curr/max;
};

snabbtjs.cos_easing = function(curr, max) {
  return (Math.cos((curr/max)*Math.PI + Math.PI) + 1)/2;
};

snabbtjs.create_cubic_bezier_easing = function(p0x, p0y, p1x, p1y) {
  return function(curr, max) {
    var t = curr/max;
    return 3*Math.pow(1-t, 2)*t*(p0x + p0y) + 3*(1-t)*Math.pow(t, 2)*(p1x + p1y) + Math.pow(t, 3);
    //return 3*Math.pow(1-t, 2)*t*(p0y) + 3*(1-t)*Math.pow(t, 2)*(p1y) + Math.pow(t, 3);
  };
};

snabbtjs.cubic_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(2*t - 1, 3)+1)/2;
};

snabbtjs.sqrt_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(t, 0.5));
};

snabbtjs.cos_wooble_easing = function (curr, max) {
  var t = curr/max;
  return t*Math.cos(4*Math.PI*t);
};

snabbtjs.atan_easing = function (curr, max) {
  var t = curr/max;
  return (Math.atan(Math.PI*t - Math.PI/2) + 1)/2;
};

snabbtjs.sinc_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 5;
  return (-Math.sin(k*Math.PI*t)/(k*t) + Math.PI)/Math.PI;
};

snabbtjs.sinc2_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 4*Math.PI*Math.pow(t, 2);
  return (1 - Math.sin(k)/k);
};

snabbtjs.sinc2 = function(curr, max) {
  var t = curr/max;
  return 1 - Math.sin(20*Math.PI*t)/(20*Math.PI*t);
};

snabbtjs.superman_easing = function(curr, max) {
  var t = curr/max;
  var x = 10*Math.PI*(t-0.5);
  return t + 0.1*(Math.sin(x)/x);
};

snabbtjs.sinc = function(curr, max) {
  var t = curr/max;
  var x = 20*Math.PI*(t);
  return (Math.sin(x)/x);
};

snabbtjs.EASING_FUNCS = {
  'linear': snabbtjs.linear_easing,
  'cubic': snabbtjs.cubic_easing,
  'square': snabbtjs.pow2_easing,
  'sqrt': snabbtjs.sqrt_easing,
  'atan': snabbtjs.atan_easing,
  'cos': snabbtjs.cos_easing,
  'sinc_wobbler': snabbtjs.sinc_wobbler_easing,
  'sinc2_wobbler': snabbtjs.sinc2_wobbler_easing,
  'superman': snabbtjs.superman_easing,
  'sinc': snabbtjs.sinc,
};
;var snabbtjs = snabbtjs || {};

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
;// Steppers

var snabbtjs = snabbtjs || {};


snabbtjs.pow2_easing = function(curr, max) {
  var t = curr/max;
  return t*t;
};

snabbtjs.linear_easing = function(curr, max) {
  return curr/max;
};

snabbtjs.cos_easing = function(curr, max) {
  return (Math.cos((curr/max)*Math.PI + Math.PI) + 1)/2;
};

snabbtjs.create_cubic_bezier_easing = function(p0x, p0y, p1x, p1y) {
  return function(curr, max) {
    var t = curr/max;
    return 3*Math.pow(1-t, 2)*t*(p0x + p0y) + 3*(1-t)*Math.pow(t, 2)*(p1x + p1y) + Math.pow(t, 3);
    //return 3*Math.pow(1-t, 2)*t*(p0y) + 3*(1-t)*Math.pow(t, 2)*(p1y) + Math.pow(t, 3);
  };
};

snabbtjs.cubic_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(2*t - 1, 3)+1)/2;
};

snabbtjs.sqrt_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(t, 0.5));
};

snabbtjs.cos_wooble_easing = function (curr, max) {
  var t = curr/max;
  return t*Math.cos(4*Math.PI*t);
};

snabbtjs.atan_easing = function (curr, max) {
  var t = curr/max;
  return (Math.atan(Math.PI*t - Math.PI/2) + 1)/2;
};

snabbtjs.sinc_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 5;
  return (-Math.sin(k*Math.PI*t)/(k*t) + Math.PI)/Math.PI;
};

snabbtjs.sinc2_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 4*Math.PI*Math.pow(t, 2);
  return (1 - Math.sin(k)/k);
};

snabbtjs.sinc2 = function(curr, max) {
  var t = curr/max;
  return 1 - Math.sin(20*Math.PI*t)/(20*Math.PI*t);
};

snabbtjs.superman_easing = function(curr, max) {
  var t = curr/max;
  var x = 10*Math.PI*(t-0.5);
  return t + 0.1*(Math.sin(x)/x);
};

snabbtjs.sinc = function(curr, max) {
  var t = curr/max;
  var x = 20*Math.PI*(t);
  return (Math.sin(x)/x);
};

snabbtjs.EASING_FUNCS = {
  'linear': snabbtjs.linear_easing,
  'cubic': snabbtjs.cubic_easing,
  'square': snabbtjs.pow2_easing,
  'sqrt': snabbtjs.sqrt_easing,
  'atan': snabbtjs.atan_easing,
  'cos': snabbtjs.cos_easing,
  'sinc_wobbler': snabbtjs.sinc_wobbler_easing,
  'sinc2_wobbler': snabbtjs.sinc2_wobbler_easing,
  'superman': snabbtjs.superman_easing,
  'sinc': snabbtjs.sinc,
};
;var snabbtjs = snabbtjs || {};

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
;// Steppers

var snabbtjs = snabbtjs || {};


snabbtjs.pow2_easing = function(curr, max) {
  var t = curr/max;
  return t*t;
};

snabbtjs.linear_easing = function(curr, max) {
  return curr/max;
};

snabbtjs.cos_easing = function(curr, max) {
  return (Math.cos((curr/max)*Math.PI + Math.PI) + 1)/2;
};

snabbtjs.create_cubic_bezier_easing = function(p0x, p0y, p1x, p1y) {
  return function(curr, max) {
    var t = curr/max;
    return 3*Math.pow(1-t, 2)*t*(p0x + p0y) + 3*(1-t)*Math.pow(t, 2)*(p1x + p1y) + Math.pow(t, 3);
    //return 3*Math.pow(1-t, 2)*t*(p0y) + 3*(1-t)*Math.pow(t, 2)*(p1y) + Math.pow(t, 3);
  };
};

snabbtjs.cubic_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(2*t - 1, 3)+1)/2;
};

snabbtjs.sqrt_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(t, 0.5));
};

snabbtjs.cos_wooble_easing = function (curr, max) {
  var t = curr/max;
  return t*Math.cos(4*Math.PI*t);
};

snabbtjs.atan_easing = function (curr, max) {
  var t = curr/max;
  return (Math.atan(Math.PI*t - Math.PI/2) + 1)/2;
};

snabbtjs.sinc_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 5;
  return (-Math.sin(k*Math.PI*t)/(k*t) + Math.PI)/Math.PI;
};

snabbtjs.sinc2_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 4*Math.PI*Math.pow(t, 2);
  return (1 - Math.sin(k)/k);
};

snabbtjs.sinc2 = function(curr, max) {
  var t = curr/max;
  return 1 - Math.sin(20*Math.PI*t)/(20*Math.PI*t);
};

snabbtjs.superman_easing = function(curr, max) {
  var t = curr/max;
  var x = 10*Math.PI*(t-0.5);
  return t + 0.1*(Math.sin(x)/x);
};

snabbtjs.sinc = function(curr, max) {
  var t = curr/max;
  var x = 20*Math.PI*(t);
  return (Math.sin(x)/x);
};

snabbtjs.EASING_FUNCS = {
  'linear': snabbtjs.linear_easing,
  'cubic': snabbtjs.cubic_easing,
  'square': snabbtjs.pow2_easing,
  'sqrt': snabbtjs.sqrt_easing,
  'atan': snabbtjs.atan_easing,
  'cos': snabbtjs.cos_easing,
  'sinc_wobbler': snabbtjs.sinc_wobbler_easing,
  'sinc2_wobbler': snabbtjs.sinc2_wobbler_easing,
  'superman': snabbtjs.superman_easing,
  'sinc': snabbtjs.sinc,
};
;var snabbtjs = snabbtjs || {};

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
;// Steppers

var snabbtjs = snabbtjs || {};


snabbtjs.pow2_easing = function(curr, max) {
  var t = curr/max;
  return t*t;
};

snabbtjs.linear_easing = function(curr, max) {
  return curr/max;
};

snabbtjs.cos_easing = function(curr, max) {
  return (Math.cos((curr/max)*Math.PI + Math.PI) + 1)/2;
};

snabbtjs.create_cubic_bezier_easing = function(p0x, p0y, p1x, p1y) {
  return function(curr, max) {
    var t = curr/max;
    return 3*Math.pow(1-t, 2)*t*(p0x + p0y) + 3*(1-t)*Math.pow(t, 2)*(p1x + p1y) + Math.pow(t, 3);
    //return 3*Math.pow(1-t, 2)*t*(p0y) + 3*(1-t)*Math.pow(t, 2)*(p1y) + Math.pow(t, 3);
  };
};

snabbtjs.cubic_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(2*t - 1, 3)+1)/2;
};

snabbtjs.sqrt_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(t, 0.5));
};

snabbtjs.cos_wooble_easing = function (curr, max) {
  var t = curr/max;
  return t*Math.cos(4*Math.PI*t);
};

snabbtjs.atan_easing = function (curr, max) {
  var t = curr/max;
  return (Math.atan(Math.PI*t - Math.PI/2) + 1)/2;
};

snabbtjs.sinc_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 5;
  return (-Math.sin(k*Math.PI*t)/(k*t) + Math.PI)/Math.PI;
};

snabbtjs.sinc2_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 4*Math.PI*Math.pow(t, 2);
  return (1 - Math.sin(k)/k);
};

snabbtjs.sinc2 = function(curr, max) {
  var t = curr/max;
  return 1 - Math.sin(20*Math.PI*t)/(20*Math.PI*t);
};

snabbtjs.superman_easing = function(curr, max) {
  var t = curr/max;
  var x = 10*Math.PI*(t-0.5);
  return t + 0.1*(Math.sin(x)/x);
};

snabbtjs.sinc = function(curr, max) {
  var t = curr/max;
  var x = 20*Math.PI*(t);
  return (Math.sin(x)/x);
};

snabbtjs.EASING_FUNCS = {
  'linear': snabbtjs.linear_easing,
  'cubic': snabbtjs.cubic_easing,
  'square': snabbtjs.pow2_easing,
  'sqrt': snabbtjs.sqrt_easing,
  'atan': snabbtjs.atan_easing,
  'cos': snabbtjs.cos_easing,
  'sinc_wobbler': snabbtjs.sinc_wobbler_easing,
  'sinc2_wobbler': snabbtjs.sinc2_wobbler_easing,
  'superman': snabbtjs.superman_easing,
  'sinc': snabbtjs.sinc,
};
;var snabbtjs = snabbtjs || {};

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
;// Steppers

var snabbtjs = snabbtjs || {};


snabbtjs.pow2_easing = function(curr, max) {
  var t = curr/max;
  return t*t;
};

snabbtjs.linear_easing = function(curr, max) {
  return curr/max;
};

snabbtjs.cos_easing = function(curr, max) {
  return (Math.cos((curr/max)*Math.PI + Math.PI) + 1)/2;
};

snabbtjs.create_cubic_bezier_easing = function(p0x, p0y, p1x, p1y) {
  return function(curr, max) {
    var t = curr/max;
    return 3*Math.pow(1-t, 2)*t*(p0x + p0y) + 3*(1-t)*Math.pow(t, 2)*(p1x + p1y) + Math.pow(t, 3);
    //return 3*Math.pow(1-t, 2)*t*(p0y) + 3*(1-t)*Math.pow(t, 2)*(p1y) + Math.pow(t, 3);
  };
};

snabbtjs.cubic_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(2*t - 1, 3)+1)/2;
};

snabbtjs.sqrt_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(t, 0.5));
};

snabbtjs.cos_wooble_easing = function (curr, max) {
  var t = curr/max;
  return t*Math.cos(4*Math.PI*t);
};

snabbtjs.atan_easing = function (curr, max) {
  var t = curr/max;
  return (Math.atan(Math.PI*t - Math.PI/2) + 1)/2;
};

snabbtjs.sinc_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 5;
  return (-Math.sin(k*Math.PI*t)/(k*t) + Math.PI)/Math.PI;
};

snabbtjs.sinc2_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 4*Math.PI*Math.pow(t, 2);
  return (1 - Math.sin(k)/k);
};

snabbtjs.sinc2 = function(curr, max) {
  var t = curr/max;
  return 1 - Math.sin(20*Math.PI*t)/(20*Math.PI*t);
};

snabbtjs.superman_easing = function(curr, max) {
  var t = curr/max;
  var x = 10*Math.PI*(t-0.5);
  return t + 0.1*(Math.sin(x)/x);
};

snabbtjs.sinc = function(curr, max) {
  var t = curr/max;
  var x = 20*Math.PI*(t);
  return (Math.sin(x)/x);
};

snabbtjs.EASING_FUNCS = {
  'linear': snabbtjs.linear_easing,
  'cubic': snabbtjs.cubic_easing,
  'square': snabbtjs.pow2_easing,
  'sqrt': snabbtjs.sqrt_easing,
  'atan': snabbtjs.atan_easing,
  'cos': snabbtjs.cos_easing,
  'sinc_wobbler': snabbtjs.sinc_wobbler_easing,
  'sinc2_wobbler': snabbtjs.sinc2_wobbler_easing,
  'superman': snabbtjs.superman_easing,
  'sinc': snabbtjs.sinc,
};
;var snabbtjs = snabbtjs || {};

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
;// Steppers

var snabbtjs = snabbtjs || {};


snabbtjs.pow2_easing = function(curr, max) {
  var t = curr/max;
  return t*t;
};

snabbtjs.linear_easing = function(curr, max) {
  return curr/max;
};

snabbtjs.cos_easing = function(curr, max) {
  return (Math.cos((curr/max)*Math.PI + Math.PI) + 1)/2;
};

snabbtjs.create_cubic_bezier_easing = function(p0x, p0y, p1x, p1y) {
  return function(curr, max) {
    var t = curr/max;
    return 3*Math.pow(1-t, 2)*t*(p0x + p0y) + 3*(1-t)*Math.pow(t, 2)*(p1x + p1y) + Math.pow(t, 3);
    //return 3*Math.pow(1-t, 2)*t*(p0y) + 3*(1-t)*Math.pow(t, 2)*(p1y) + Math.pow(t, 3);
  };
};

snabbtjs.cubic_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(2*t - 1, 3)+1)/2;
};

snabbtjs.sqrt_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(t, 0.5));
};

snabbtjs.cos_wooble_easing = function (curr, max) {
  var t = curr/max;
  return t*Math.cos(4*Math.PI*t);
};

snabbtjs.atan_easing = function (curr, max) {
  var t = curr/max;
  return (Math.atan(Math.PI*t - Math.PI/2) + 1)/2;
};

snabbtjs.sinc_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 5;
  return (-Math.sin(k*Math.PI*t)/(k*t) + Math.PI)/Math.PI;
};

snabbtjs.sinc2_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 4*Math.PI*Math.pow(t, 2);
  return (1 - Math.sin(k)/k);
};

snabbtjs.sinc2 = function(curr, max) {
  var t = curr/max;
  return 1 - Math.sin(20*Math.PI*t)/(20*Math.PI*t);
};

snabbtjs.superman_easing = function(curr, max) {
  var t = curr/max;
  var x = 10*Math.PI*(t-0.5);
  return t + 0.1*(Math.sin(x)/x);
};

snabbtjs.sinc = function(curr, max) {
  var t = curr/max;
  var x = 20*Math.PI*(t);
  return (Math.sin(x)/x);
};

snabbtjs.EASING_FUNCS = {
  'linear': snabbtjs.linear_easing,
  'cubic': snabbtjs.cubic_easing,
  'square': snabbtjs.pow2_easing,
  'sqrt': snabbtjs.sqrt_easing,
  'atan': snabbtjs.atan_easing,
  'cos': snabbtjs.cos_easing,
  'sinc_wobbler': snabbtjs.sinc_wobbler_easing,
  'sinc2_wobbler': snabbtjs.sinc2_wobbler_easing,
  'superman': snabbtjs.superman_easing,
  'sinc': snabbtjs.sinc,
};
;var snabbtjs = snabbtjs || {};

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
;// Steppers

var snabbtjs = snabbtjs || {};


snabbtjs.pow2_easing = function(curr, max) {
  var t = curr/max;
  return t*t;
};

snabbtjs.linear_easing = function(curr, max) {
  return curr/max;
};

snabbtjs.cos_easing = function(curr, max) {
  return (Math.cos((curr/max)*Math.PI + Math.PI) + 1)/2;
};

snabbtjs.create_cubic_bezier_easing = function(p0x, p0y, p1x, p1y) {
  return function(curr, max) {
    var t = curr/max;
    return 3*Math.pow(1-t, 2)*t*(p0x + p0y) + 3*(1-t)*Math.pow(t, 2)*(p1x + p1y) + Math.pow(t, 3);
    //return 3*Math.pow(1-t, 2)*t*(p0y) + 3*(1-t)*Math.pow(t, 2)*(p1y) + Math.pow(t, 3);
  };
};

snabbtjs.cubic_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(2*t - 1, 3)+1)/2;
};

snabbtjs.sqrt_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(t, 0.5));
};

snabbtjs.cos_wooble_easing = function (curr, max) {
  var t = curr/max;
  return t*Math.cos(4*Math.PI*t);
};

snabbtjs.atan_easing = function (curr, max) {
  var t = curr/max;
  return (Math.atan(Math.PI*t - Math.PI/2) + 1)/2;
};

snabbtjs.sinc_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 5;
  return (-Math.sin(k*Math.PI*t)/(k*t) + Math.PI)/Math.PI;
};

snabbtjs.sinc2_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 4*Math.PI*Math.pow(t, 2);
  return (1 - Math.sin(k)/k);
};

snabbtjs.sinc2 = function(curr, max) {
  var t = curr/max;
  return 1 - Math.sin(20*Math.PI*t)/(20*Math.PI*t);
};

snabbtjs.superman_easing = function(curr, max) {
  var t = curr/max;
  var x = 10*Math.PI*(t-0.5);
  return t + 0.1*(Math.sin(x)/x);
};

snabbtjs.sinc = function(curr, max) {
  var t = curr/max;
  var x = 20*Math.PI*(t);
  return (Math.sin(x)/x);
};

snabbtjs.EASING_FUNCS = {
  'linear': snabbtjs.linear_easing,
  'cubic': snabbtjs.cubic_easing,
  'square': snabbtjs.pow2_easing,
  'sqrt': snabbtjs.sqrt_easing,
  'atan': snabbtjs.atan_easing,
  'cos': snabbtjs.cos_easing,
  'sinc_wobbler': snabbtjs.sinc_wobbler_easing,
  'sinc2_wobbler': snabbtjs.sinc2_wobbler_easing,
  'superman': snabbtjs.superman_easing,
  'sinc': snabbtjs.sinc,
};
;var snabbtjs = snabbtjs || {};

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
;// Steppers

var snabbtjs = snabbtjs || {};


snabbtjs.pow2_easing = function(curr, max) {
  var t = curr/max;
  return t*t;
};

snabbtjs.linear_easing = function(curr, max) {
  return curr/max;
};

snabbtjs.cos_easing = function(curr, max) {
  return (Math.cos((curr/max)*Math.PI + Math.PI) + 1)/2;
};

snabbtjs.create_cubic_bezier_easing = function(p0x, p0y, p1x, p1y) {
  return function(curr, max) {
    var t = curr/max;
    return 3*Math.pow(1-t, 2)*t*(p0x + p0y) + 3*(1-t)*Math.pow(t, 2)*(p1x + p1y) + Math.pow(t, 3);
    //return 3*Math.pow(1-t, 2)*t*(p0y) + 3*(1-t)*Math.pow(t, 2)*(p1y) + Math.pow(t, 3);
  };
};

snabbtjs.cubic_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(2*t - 1, 3)+1)/2;
};

snabbtjs.sqrt_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(t, 0.5));
};

snabbtjs.cos_wooble_easing = function (curr, max) {
  var t = curr/max;
  return t*Math.cos(4*Math.PI*t);
};

snabbtjs.atan_easing = function (curr, max) {
  var t = curr/max;
  return (Math.atan(Math.PI*t - Math.PI/2) + 1)/2;
};

snabbtjs.sinc_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 5;
  return (-Math.sin(k*Math.PI*t)/(k*t) + Math.PI)/Math.PI;
};

snabbtjs.sinc2_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 4*Math.PI*Math.pow(t, 2);
  return (1 - Math.sin(k)/k);
};

snabbtjs.sinc2 = function(curr, max) {
  var t = curr/max;
  return 1 - Math.sin(20*Math.PI*t)/(20*Math.PI*t);
};

snabbtjs.superman_easing = function(curr, max) {
  var t = curr/max;
  var x = 10*Math.PI*(t-0.5);
  return t + 0.1*(Math.sin(x)/x);
};

snabbtjs.sinc = function(curr, max) {
  var t = curr/max;
  var x = 20*Math.PI*(t);
  return (Math.sin(x)/x);
};

snabbtjs.EASING_FUNCS = {
  'linear': snabbtjs.linear_easing,
  'cubic': snabbtjs.cubic_easing,
  'square': snabbtjs.pow2_easing,
  'sqrt': snabbtjs.sqrt_easing,
  'atan': snabbtjs.atan_easing,
  'cos': snabbtjs.cos_easing,
  'sinc_wobbler': snabbtjs.sinc_wobbler_easing,
  'sinc2_wobbler': snabbtjs.sinc2_wobbler_easing,
  'superman': snabbtjs.superman_easing,
  'sinc': snabbtjs.sinc,
};
;var snabbtjs = snabbtjs || {};

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
;// Steppers

var snabbtjs = snabbtjs || {};


snabbtjs.pow2_easing = function(curr, max) {
  var t = curr/max;
  return t*t;
};

snabbtjs.linear_easing = function(curr, max) {
  return curr/max;
};

snabbtjs.cos_easing = function(curr, max) {
  return (Math.cos((curr/max)*Math.PI + Math.PI) + 1)/2;
};

snabbtjs.create_cubic_bezier_easing = function(p0x, p0y, p1x, p1y) {
  return function(curr, max) {
    var t = curr/max;
    return 3*Math.pow(1-t, 2)*t*(p0x + p0y) + 3*(1-t)*Math.pow(t, 2)*(p1x + p1y) + Math.pow(t, 3);
    //return 3*Math.pow(1-t, 2)*t*(p0y) + 3*(1-t)*Math.pow(t, 2)*(p1y) + Math.pow(t, 3);
  };
};

snabbtjs.cubic_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(2*t - 1, 3)+1)/2;
};

snabbtjs.sqrt_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(t, 0.5));
};

snabbtjs.cos_wooble_easing = function (curr, max) {
  var t = curr/max;
  return t*Math.cos(4*Math.PI*t);
};

snabbtjs.atan_easing = function (curr, max) {
  var t = curr/max;
  return (Math.atan(Math.PI*t - Math.PI/2) + 1)/2;
};

snabbtjs.sinc_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 5;
  return (-Math.sin(k*Math.PI*t)/(k*t) + Math.PI)/Math.PI;
};

snabbtjs.sinc2_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 4*Math.PI*Math.pow(t, 2);
  return (1 - Math.sin(k)/k);
};

snabbtjs.sinc2 = function(curr, max) {
  var t = curr/max;
  return 1 - Math.sin(20*Math.PI*t)/(20*Math.PI*t);
};

snabbtjs.superman_easing = function(curr, max) {
  var t = curr/max;
  var x = 10*Math.PI*(t-0.5);
  return t + 0.1*(Math.sin(x)/x);
};

snabbtjs.sinc = function(curr, max) {
  var t = curr/max;
  var x = 20*Math.PI*(t);
  return (Math.sin(x)/x);
};

snabbtjs.EASING_FUNCS = {
  'linear': snabbtjs.linear_easing,
  'cubic': snabbtjs.cubic_easing,
  'square': snabbtjs.pow2_easing,
  'sqrt': snabbtjs.sqrt_easing,
  'atan': snabbtjs.atan_easing,
  'cos': snabbtjs.cos_easing,
  'sinc_wobbler': snabbtjs.sinc_wobbler_easing,
  'sinc2_wobbler': snabbtjs.sinc2_wobbler_easing,
  'superman': snabbtjs.superman_easing,
  'sinc': snabbtjs.sinc,
};
;var snabbtjs = snabbtjs || {};

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
;// Steppers

var snabbtjs = snabbtjs || {};


snabbtjs.pow2_easing = function(curr, max) {
  var t = curr/max;
  return t*t;
};

snabbtjs.linear_easing = function(curr, max) {
  return curr/max;
};

snabbtjs.cos_easing = function(curr, max) {
  return (Math.cos((curr/max)*Math.PI + Math.PI) + 1)/2;
};

snabbtjs.create_cubic_bezier_easing = function(p0x, p0y, p1x, p1y) {
  return function(curr, max) {
    var t = curr/max;
    return 3*Math.pow(1-t, 2)*t*(p0x + p0y) + 3*(1-t)*Math.pow(t, 2)*(p1x + p1y) + Math.pow(t, 3);
    //return 3*Math.pow(1-t, 2)*t*(p0y) + 3*(1-t)*Math.pow(t, 2)*(p1y) + Math.pow(t, 3);
  };
};

snabbtjs.cubic_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(2*t - 1, 3)+1)/2;
};

snabbtjs.sqrt_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(t, 0.5));
};

snabbtjs.cos_wooble_easing = function (curr, max) {
  var t = curr/max;
  return t*Math.cos(4*Math.PI*t);
};

snabbtjs.atan_easing = function (curr, max) {
  var t = curr/max;
  return (Math.atan(Math.PI*t - Math.PI/2) + 1)/2;
};

snabbtjs.sinc_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 5;
  return (-Math.sin(k*Math.PI*t)/(k*t) + Math.PI)/Math.PI;
};

snabbtjs.sinc2_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 4*Math.PI*Math.pow(t, 2);
  return (1 - Math.sin(k)/k);
};

snabbtjs.sinc2 = function(curr, max) {
  var t = curr/max;
  return 1 - Math.sin(20*Math.PI*t)/(20*Math.PI*t);
};

snabbtjs.superman_easing = function(curr, max) {
  var t = curr/max;
  var x = 10*Math.PI*(t-0.5);
  return t + 0.1*(Math.sin(x)/x);
};

snabbtjs.sinc = function(curr, max) {
  var t = curr/max;
  var x = 20*Math.PI*(t);
  return (Math.sin(x)/x);
};

snabbtjs.EASING_FUNCS = {
  'linear': snabbtjs.linear_easing,
  'cubic': snabbtjs.cubic_easing,
  'square': snabbtjs.pow2_easing,
  'sqrt': snabbtjs.sqrt_easing,
  'atan': snabbtjs.atan_easing,
  'cos': snabbtjs.cos_easing,
  'sinc_wobbler': snabbtjs.sinc_wobbler_easing,
  'sinc2_wobbler': snabbtjs.sinc2_wobbler_easing,
  'superman': snabbtjs.superman_easing,
  'sinc': snabbtjs.sinc,
};
;var snabbtjs = snabbtjs || {};

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
;// Steppers

var snabbtjs = snabbtjs || {};


snabbtjs.pow2_easing = function(curr, max) {
  var t = curr/max;
  return t*t;
};

snabbtjs.linear_easing = function(curr, max) {
  return curr/max;
};

snabbtjs.cos_easing = function(curr, max) {
  return (Math.cos((curr/max)*Math.PI + Math.PI) + 1)/2;
};

snabbtjs.create_cubic_bezier_easing = function(p0x, p0y, p1x, p1y) {
  return function(curr, max) {
    var t = curr/max;
    return 3*Math.pow(1-t, 2)*t*(p0x + p0y) + 3*(1-t)*Math.pow(t, 2)*(p1x + p1y) + Math.pow(t, 3);
    //return 3*Math.pow(1-t, 2)*t*(p0y) + 3*(1-t)*Math.pow(t, 2)*(p1y) + Math.pow(t, 3);
  };
};

snabbtjs.cubic_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(2*t - 1, 3)+1)/2;
};

snabbtjs.sqrt_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(t, 0.5));
};

snabbtjs.cos_wooble_easing = function (curr, max) {
  var t = curr/max;
  return t*Math.cos(4*Math.PI*t);
};

snabbtjs.atan_easing = function (curr, max) {
  var t = curr/max;
  return (Math.atan(Math.PI*t - Math.PI/2) + 1)/2;
};

snabbtjs.sinc_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 5;
  return (-Math.sin(k*Math.PI*t)/(k*t) + Math.PI)/Math.PI;
};

snabbtjs.sinc2_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 4*Math.PI*Math.pow(t, 2);
  return (1 - Math.sin(k)/k);
};

snabbtjs.sinc2 = function(curr, max) {
  var t = curr/max;
  return 1 - Math.sin(20*Math.PI*t)/(20*Math.PI*t);
};

snabbtjs.superman_easing = function(curr, max) {
  var t = curr/max;
  var x = 10*Math.PI*(t-0.5);
  return t + 0.1*(Math.sin(x)/x);
};

snabbtjs.sinc = function(curr, max) {
  var t = curr/max;
  var x = 20*Math.PI*(t);
  return (Math.sin(x)/x);
};

snabbtjs.EASING_FUNCS = {
  'linear': snabbtjs.linear_easing,
  'cubic': snabbtjs.cubic_easing,
  'square': snabbtjs.pow2_easing,
  'sqrt': snabbtjs.sqrt_easing,
  'atan': snabbtjs.atan_easing,
  'cos': snabbtjs.cos_easing,
  'sinc_wobbler': snabbtjs.sinc_wobbler_easing,
  'sinc2_wobbler': snabbtjs.sinc2_wobbler_easing,
  'superman': snabbtjs.superman_easing,
  'sinc': snabbtjs.sinc,
};
;var snabbtjs = snabbtjs || {};

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
;// Steppers

var snabbtjs = snabbtjs || {};


snabbtjs.pow2_easing = function(curr, max) {
  var t = curr/max;
  return t*t;
};

snabbtjs.linear_easing = function(curr, max) {
  return curr/max;
};

snabbtjs.cos_easing = function(curr, max) {
  return (Math.cos((curr/max)*Math.PI + Math.PI) + 1)/2;
};

snabbtjs.create_cubic_bezier_easing = function(p0x, p0y, p1x, p1y) {
  return function(curr, max) {
    var t = curr/max;
    return 3*Math.pow(1-t, 2)*t*(p0x + p0y) + 3*(1-t)*Math.pow(t, 2)*(p1x + p1y) + Math.pow(t, 3);
    //return 3*Math.pow(1-t, 2)*t*(p0y) + 3*(1-t)*Math.pow(t, 2)*(p1y) + Math.pow(t, 3);
  };
};

snabbtjs.cubic_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(2*t - 1, 3)+1)/2;
};

snabbtjs.sqrt_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(t, 0.5));
};

snabbtjs.cos_wooble_easing = function (curr, max) {
  var t = curr/max;
  return t*Math.cos(4*Math.PI*t);
};

snabbtjs.atan_easing = function (curr, max) {
  var t = curr/max;
  return (Math.atan(Math.PI*t - Math.PI/2) + 1)/2;
};

snabbtjs.sinc_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 5;
  return (-Math.sin(k*Math.PI*t)/(k*t) + Math.PI)/Math.PI;
};

snabbtjs.sinc2_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 4*Math.PI*Math.pow(t, 2);
  return (1 - Math.sin(k)/k);
};

snabbtjs.sinc2 = function(curr, max) {
  var t = curr/max;
  return 1 - Math.sin(20*Math.PI*t)/(20*Math.PI*t);
};

snabbtjs.superman_easing = function(curr, max) {
  var t = curr/max;
  var x = 10*Math.PI*(t-0.5);
  return t + 0.1*(Math.sin(x)/x);
};

snabbtjs.sinc = function(curr, max) {
  var t = curr/max;
  var x = 20*Math.PI*(t);
  return (Math.sin(x)/x);
};

snabbtjs.EASING_FUNCS = {
  'linear': snabbtjs.linear_easing,
  'cubic': snabbtjs.cubic_easing,
  'square': snabbtjs.pow2_easing,
  'sqrt': snabbtjs.sqrt_easing,
  'atan': snabbtjs.atan_easing,
  'cos': snabbtjs.cos_easing,
  'sinc_wobbler': snabbtjs.sinc_wobbler_easing,
  'sinc2_wobbler': snabbtjs.sinc2_wobbler_easing,
  'superman': snabbtjs.superman_easing,
  'sinc': snabbtjs.sinc,
};
;var snabbtjs = snabbtjs || {};

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
;// Steppers

var snabbtjs = snabbtjs || {};


snabbtjs.pow2_easing = function(curr, max) {
  var t = curr/max;
  return t*t;
};

snabbtjs.linear_easing = function(curr, max) {
  return curr/max;
};

snabbtjs.cos_easing = function(curr, max) {
  return (Math.cos((curr/max)*Math.PI + Math.PI) + 1)/2;
};

snabbtjs.create_cubic_bezier_easing = function(p0x, p0y, p1x, p1y) {
  return function(curr, max) {
    var t = curr/max;
    return 3*Math.pow(1-t, 2)*t*(p0x + p0y) + 3*(1-t)*Math.pow(t, 2)*(p1x + p1y) + Math.pow(t, 3);
    //return 3*Math.pow(1-t, 2)*t*(p0y) + 3*(1-t)*Math.pow(t, 2)*(p1y) + Math.pow(t, 3);
  };
};

snabbtjs.cubic_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(2*t - 1, 3)+1)/2;
};

snabbtjs.sqrt_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(t, 0.5));
};

snabbtjs.cos_wooble_easing = function (curr, max) {
  var t = curr/max;
  return t*Math.cos(4*Math.PI*t);
};

snabbtjs.atan_easing = function (curr, max) {
  var t = curr/max;
  return (Math.atan(Math.PI*t - Math.PI/2) + 1)/2;
};

snabbtjs.sinc_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 5;
  return (-Math.sin(k*Math.PI*t)/(k*t) + Math.PI)/Math.PI;
};

snabbtjs.sinc2_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 4*Math.PI*Math.pow(t, 2);
  return (1 - Math.sin(k)/k);
};

snabbtjs.sinc2 = function(curr, max) {
  var t = curr/max;
  return 1 - Math.sin(20*Math.PI*t)/(20*Math.PI*t);
};

snabbtjs.superman_easing = function(curr, max) {
  var t = curr/max;
  var x = 10*Math.PI*(t-0.5);
  return t + 0.1*(Math.sin(x)/x);
};

snabbtjs.sinc = function(curr, max) {
  var t = curr/max;
  var x = 20*Math.PI*(t);
  return (Math.sin(x)/x);
};

snabbtjs.EASING_FUNCS = {
  'linear': snabbtjs.linear_easing,
  'cubic': snabbtjs.cubic_easing,
  'square': snabbtjs.pow2_easing,
  'sqrt': snabbtjs.sqrt_easing,
  'atan': snabbtjs.atan_easing,
  'cos': snabbtjs.cos_easing,
  'sinc_wobbler': snabbtjs.sinc_wobbler_easing,
  'sinc2_wobbler': snabbtjs.sinc2_wobbler_easing,
  'superman': snabbtjs.superman_easing,
  'sinc': snabbtjs.sinc,
};
;var snabbtjs = snabbtjs || {};

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
;// Steppers

var snabbtjs = snabbtjs || {};


snabbtjs.pow2_easing = function(curr, max) {
  var t = curr/max;
  return t*t;
};

snabbtjs.linear_easing = function(curr, max) {
  return curr/max;
};

snabbtjs.cos_easing = function(curr, max) {
  return (Math.cos((curr/max)*Math.PI + Math.PI) + 1)/2;
};

snabbtjs.create_cubic_bezier_easing = function(p0x, p0y, p1x, p1y) {
  return function(curr, max) {
    var t = curr/max;
    return 3*Math.pow(1-t, 2)*t*(p0x + p0y) + 3*(1-t)*Math.pow(t, 2)*(p1x + p1y) + Math.pow(t, 3);
    //return 3*Math.pow(1-t, 2)*t*(p0y) + 3*(1-t)*Math.pow(t, 2)*(p1y) + Math.pow(t, 3);
  };
};

snabbtjs.cubic_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(2*t - 1, 3)+1)/2;
};

snabbtjs.sqrt_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(t, 0.5));
};

snabbtjs.cos_wooble_easing = function (curr, max) {
  var t = curr/max;
  return t*Math.cos(4*Math.PI*t);
};

snabbtjs.atan_easing = function (curr, max) {
  var t = curr/max;
  return (Math.atan(Math.PI*t - Math.PI/2) + 1)/2;
};

snabbtjs.sinc_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 5;
  return (-Math.sin(k*Math.PI*t)/(k*t) + Math.PI)/Math.PI;
};

snabbtjs.sinc2_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 4*Math.PI*Math.pow(t, 2);
  return (1 - Math.sin(k)/k);
};

snabbtjs.sinc2 = function(curr, max) {
  var t = curr/max;
  return 1 - Math.sin(20*Math.PI*t)/(20*Math.PI*t);
};

snabbtjs.superman_easing = function(curr, max) {
  var t = curr/max;
  var x = 10*Math.PI*(t-0.5);
  return t + 0.1*(Math.sin(x)/x);
};

snabbtjs.sinc = function(curr, max) {
  var t = curr/max;
  var x = 20*Math.PI*(t);
  return (Math.sin(x)/x);
};

snabbtjs.EASING_FUNCS = {
  'linear': snabbtjs.linear_easing,
  'cubic': snabbtjs.cubic_easing,
  'square': snabbtjs.pow2_easing,
  'sqrt': snabbtjs.sqrt_easing,
  'atan': snabbtjs.atan_easing,
  'cos': snabbtjs.cos_easing,
  'sinc_wobbler': snabbtjs.sinc_wobbler_easing,
  'sinc2_wobbler': snabbtjs.sinc2_wobbler_easing,
  'superman': snabbtjs.superman_easing,
  'sinc': snabbtjs.sinc,
};
;var snabbtjs = snabbtjs || {};

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
;// Steppers

var snabbtjs = snabbtjs || {};


snabbtjs.pow2_easing = function(curr, max) {
  var t = curr/max;
  return t*t;
};

snabbtjs.linear_easing = function(curr, max) {
  return curr/max;
};

snabbtjs.cos_easing = function(curr, max) {
  return (Math.cos((curr/max)*Math.PI + Math.PI) + 1)/2;
};

snabbtjs.create_cubic_bezier_easing = function(p0x, p0y, p1x, p1y) {
  return function(curr, max) {
    var t = curr/max;
    return 3*Math.pow(1-t, 2)*t*(p0x + p0y) + 3*(1-t)*Math.pow(t, 2)*(p1x + p1y) + Math.pow(t, 3);
    //return 3*Math.pow(1-t, 2)*t*(p0y) + 3*(1-t)*Math.pow(t, 2)*(p1y) + Math.pow(t, 3);
  };
};

snabbtjs.cubic_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(2*t - 1, 3)+1)/2;
};

snabbtjs.sqrt_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(t, 0.5));
};

snabbtjs.cos_wooble_easing = function (curr, max) {
  var t = curr/max;
  return t*Math.cos(4*Math.PI*t);
};

snabbtjs.atan_easing = function (curr, max) {
  var t = curr/max;
  return (Math.atan(Math.PI*t - Math.PI/2) + 1)/2;
};

snabbtjs.sinc_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 5;
  return (-Math.sin(k*Math.PI*t)/(k*t) + Math.PI)/Math.PI;
};

snabbtjs.sinc2_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 4*Math.PI*Math.pow(t, 2);
  return (1 - Math.sin(k)/k);
};

snabbtjs.sinc2 = function(curr, max) {
  var t = curr/max;
  return 1 - Math.sin(20*Math.PI*t)/(20*Math.PI*t);
};

snabbtjs.superman_easing = function(curr, max) {
  var t = curr/max;
  var x = 10*Math.PI*(t-0.5);
  return t + 0.1*(Math.sin(x)/x);
};

snabbtjs.sinc = function(curr, max) {
  var t = curr/max;
  var x = 20*Math.PI*(t);
  return (Math.sin(x)/x);
};

snabbtjs.EASING_FUNCS = {
  'linear': snabbtjs.linear_easing,
  'cubic': snabbtjs.cubic_easing,
  'square': snabbtjs.pow2_easing,
  'sqrt': snabbtjs.sqrt_easing,
  'atan': snabbtjs.atan_easing,
  'cos': snabbtjs.cos_easing,
  'sinc_wobbler': snabbtjs.sinc_wobbler_easing,
  'sinc2_wobbler': snabbtjs.sinc2_wobbler_easing,
  'superman': snabbtjs.superman_easing,
  'sinc': snabbtjs.sinc,
};
;var snabbtjs = snabbtjs || {};

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
;// Steppers

var snabbtjs = snabbtjs || {};


snabbtjs.pow2_easing = function(curr, max) {
  var t = curr/max;
  return t*t;
};

snabbtjs.linear_easing = function(curr, max) {
  return curr/max;
};

snabbtjs.cos_easing = function(curr, max) {
  return (Math.cos((curr/max)*Math.PI + Math.PI) + 1)/2;
};

snabbtjs.create_cubic_bezier_easing = function(p0x, p0y, p1x, p1y) {
  return function(curr, max) {
    var t = curr/max;
    return 3*Math.pow(1-t, 2)*t*(p0x + p0y) + 3*(1-t)*Math.pow(t, 2)*(p1x + p1y) + Math.pow(t, 3);
    //return 3*Math.pow(1-t, 2)*t*(p0y) + 3*(1-t)*Math.pow(t, 2)*(p1y) + Math.pow(t, 3);
  };
};

snabbtjs.cubic_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(2*t - 1, 3)+1)/2;
};

snabbtjs.sqrt_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(t, 0.5));
};

snabbtjs.cos_wooble_easing = function (curr, max) {
  var t = curr/max;
  return t*Math.cos(4*Math.PI*t);
};

snabbtjs.atan_easing = function (curr, max) {
  var t = curr/max;
  return (Math.atan(Math.PI*t - Math.PI/2) + 1)/2;
};

snabbtjs.sinc_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 5;
  return (-Math.sin(k*Math.PI*t)/(k*t) + Math.PI)/Math.PI;
};

snabbtjs.sinc2_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 4*Math.PI*Math.pow(t, 2);
  return (1 - Math.sin(k)/k);
};

snabbtjs.sinc2 = function(curr, max) {
  var t = curr/max;
  return 1 - Math.sin(20*Math.PI*t)/(20*Math.PI*t);
};

snabbtjs.superman_easing = function(curr, max) {
  var t = curr/max;
  var x = 10*Math.PI*(t-0.5);
  return t + 0.1*(Math.sin(x)/x);
};

snabbtjs.sinc = function(curr, max) {
  var t = curr/max;
  var x = 20*Math.PI*(t);
  return (Math.sin(x)/x);
};

snabbtjs.EASING_FUNCS = {
  'linear': snabbtjs.linear_easing,
  'cubic': snabbtjs.cubic_easing,
  'square': snabbtjs.pow2_easing,
  'sqrt': snabbtjs.sqrt_easing,
  'atan': snabbtjs.atan_easing,
  'cos': snabbtjs.cos_easing,
  'sinc_wobbler': snabbtjs.sinc_wobbler_easing,
  'sinc2_wobbler': snabbtjs.sinc2_wobbler_easing,
  'superman': snabbtjs.superman_easing,
  'sinc': snabbtjs.sinc,
};
;var snabbtjs = snabbtjs || {};

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
;// Steppers

var snabbtjs = snabbtjs || {};


snabbtjs.pow2_easing = function(curr, max) {
  var t = curr/max;
  return t*t;
};

snabbtjs.linear_easing = function(curr, max) {
  return curr/max;
};

snabbtjs.cos_easing = function(curr, max) {
  return (Math.cos((curr/max)*Math.PI + Math.PI) + 1)/2;
};

snabbtjs.create_cubic_bezier_easing = function(p0x, p0y, p1x, p1y) {
  return function(curr, max) {
    var t = curr/max;
    return 3*Math.pow(1-t, 2)*t*(p0x + p0y) + 3*(1-t)*Math.pow(t, 2)*(p1x + p1y) + Math.pow(t, 3);
    //return 3*Math.pow(1-t, 2)*t*(p0y) + 3*(1-t)*Math.pow(t, 2)*(p1y) + Math.pow(t, 3);
  };
};

snabbtjs.cubic_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(2*t - 1, 3)+1)/2;
};

snabbtjs.sqrt_easing = function(curr, max) {
  var t = curr/max;
  return (Math.pow(t, 0.5));
};

snabbtjs.cos_wooble_easing = function (curr, max) {
  var t = curr/max;
  return t*Math.cos(4*Math.PI*t);
};

snabbtjs.atan_easing = function (curr, max) {
  var t = curr/max;
  return (Math.atan(Math.PI*t - Math.PI/2) + 1)/2;
};

snabbtjs.sinc_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 5;
  return (-Math.sin(k*Math.PI*t)/(k*t) + Math.PI)/Math.PI;
};

snabbtjs.sinc2_wobbler_easing = function (curr, max) {
  var t = curr/max;
  var k = 4*Math.PI*Math.pow(t, 2);
  return (1 - Math.sin(k)/k);
};

snabbtjs.sinc2 = function(curr, max) {
  var t = curr/max;
  return 1 - Math.sin(20*Math.PI*t)/(20*Math.PI*t);
};

snabbtjs.superman_easing = function(curr, max) {
  var t = curr/max;
  var x = 10*Math.PI*(t-0.5);
  return t + 0.1*(Math.sin(x)/x);
};

snabbtjs.sinc = function(curr, max) {
  var t = curr/max;
  var x = 20*Math.PI*(t);
  return (Math.sin(x)/x);
};

snabbtjs.EASING_FUNCS = {
  'linear': snabbtjs.linear_easing,
  'cubic': snabbtjs.cubic_easing,
  'square': snabbtjs.pow2_easing,
  'sqrt': snabbtjs.sqrt_easing,
  'atan': snabbtjs.atan_easing,
  'cos': snabbtjs.cos_easing,
  'sinc_wobbler': snabbtjs.sinc_wobbler_easing,
  'sinc2_wobbler': snabbtjs.sinc2_wobbler_easing,
  'superman': snabbtjs.superman_easing,
  'sinc': snabbtjs.sinc,
};
;(function ( $ ) {
  $.fn.snabbt = function(options) {
    return snabbt(this.toArray(), options);
  };
}( jQuery ));
;var tick_requests = [];

function requestAnimFrame(func) {
  tick_requests.push(func);
}

function master_tick(time) {
  var length = tick_requests.length;
  for(var i=0;i<length;++i) {
    tick_requests[i](time);
  }
  tick_requests.splice(0, length);
  window.requestAnimationFrame(master_tick);
}

window.requestAnimationFrame(master_tick);

function state_from_options(p, options, prefix) {

  if(options[prefix + 'pos']) {
    p.x = options[prefix + 'pos'][0];
    p.y = options[prefix + 'pos'][1];
    p.z = options[prefix + 'pos'][2];
  }
  if(options[prefix + 'rot']) {
    p.ax =  options[prefix + 'rot'][0];
    p.ay =  options[prefix + 'rot'][1];
    p.az =  options[prefix + 'rot'][2];
  }
  if(options[prefix + 'rot_post']) {
    p.bx =  options[prefix + 'rot_post'][0];
    p.by =  options[prefix + 'rot_post'][1];
    p.bz =  options[prefix + 'rot_post'][2];
  }
  if(options[prefix + 'scale']) {
    p.sx =  options[prefix + 'scale'][0];
    p.sy =  options[prefix + 'scale'][1];
  }
  if(options[prefix + 'width'] !== undefined) {
    p.width =  options[prefix + 'width'];
  }
  if(options[prefix + 'height'] !== undefined) {
    p.height =  options[prefix + 'height'];
  }
  if(options[prefix + 'opacity'] !== undefined) {
    p.opacity =  options[prefix + 'opacity'];
  }
  return p;
}


function snabbt(e, options) {
  if(e == 'scroll') {
    return snabbtjs.setup_scroll_animation(options);
  }

  var start = new snabbtjs.State({});
  start = state_from_options(start, options, 'from_');
  var end = new snabbtjs.State({});
  end = state_from_options(end, options, '');

  var anim_options = {
    start_state: start,
    end_state: end,
    duration: options.duration || 1000,
    delay: options.delay || 0,
    offset: options.offset
  };
  if(options.easing)
    anim_options.easing = snabbtjs.EASING_FUNCS[options.easing];
  if(options.manual)
    anim_options.mode = snabbtjs.AnimationType.MANUAL;
  var animation = new snabbtjs.Animation(anim_options);

  var queue = [];
  var chainer = {
    then: function(opts) {
      queue.unshift(opts);
      return chainer;
    }
  };

  function tick(time) {
    animation.tick(time);
    var current_state = animation.current_state();
    snabbtjs.set_css(e, current_state);

    if(animation.completed()) {
      var end_state = animation.end_state();
      snabbtjs.set_css(e, end_state);

      if(options.loop > 1) {
        options.loop -= 1;
        animation.assign(anim_options);
        requestAnimFrame(tick);
      } else {
        if(options.callback) {
          options.callback();
        }
        if(queue.length) {
          options = queue.pop();

          start = state_from_options(end, options, 'from_');
          end = state_from_options(new snabbtjs.State({}), options, '');
          animation.assign({
            start_state: start,
            end_state: end,
            duration: options.duration || 1000,
            delay: options.delay || 0,
            offset: options.offset
          });
          if(options.easing)
            animation.easing = snabbtjs.EASING_FUNCS[options.easing];

          animation.tick(time);
          requestAnimFrame(tick);
        }
      }
    } else {
      requestAnimFrame(tick);
    }
  }

  requestAnimFrame(tick);
  if(options.manual) 
    return animation;
  else
    return chainer;
}

snabbtjs.setup_scroll_animation = function(options) {
  var animation = new snabbtjs.ScrollAnimation(options);

  function tick(time) {
    animation.tick(time);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  }
  requestAnimFrame(tick);
};

;var snabbtjs = snabbtjs || {};

snabbtjs.assigned_matrix_multiplication = function(a, b, res) {
  // Unrolled loop
  res[0] = a[0] * b[0] +
           a[1] * b[4] +
           a[2] * b[8] +
           a[3] * b[12];
  res[1] = a[0] * b[1] +
           a[1] * b[5] +
           a[2] * b[9] +
           a[3] * b[13];
  res[2] = a[0] * b[2] +
           a[1] * b[6] +
           a[2] * b[10] +
           a[3] * b[14];
  res[3] = a[0] * b[3] +
           a[1] * b[7] +
           a[2] * b[11] +
           a[3] * b[15];

  res[4] = a[4] * b[0] +
           a[5] * b[4] +
           a[6] * b[8] +
           a[7] * b[12];
  res[5] = a[4] * b[1] +
           a[5] * b[5] +
           a[6] * b[9] +
           a[7] * b[13];
  res[6] = a[4] * b[2] +
           a[5] * b[6] +
           a[6] * b[10] +
           a[7] * b[14];
  res[7] = a[4] * b[3] +
           a[5] * b[7] +
           a[6] * b[11] +
           a[7] * b[15];

  res[8] = a[8] * b[0] +
           a[9] * b[4] +
           a[10] * b[8] +
           a[11] * b[12];
  res[9] = a[8] * b[1] +
           a[9] * b[5] +
           a[10] * b[9] +
           a[11] * b[13];
  res[10] = a[8] * b[2] +
            a[9] * b[6] +
            a[10] * b[10] +
            a[11] * b[14];
  res[11] = a[8] * b[3] +
            a[9] * b[7] +
            a[10] * b[11] +
            a[11] * b[15];

  res[12] = a[12] * b[0] +
            a[13] * b[4] +
            a[14] * b[8] +
            a[15] * b[12];
  res[13] = a[12] * b[1] +
            a[13] * b[5] +
            a[14] * b[9] +
            a[15] * b[13];
  res[14] = a[12] * b[2] +
            a[13] * b[6] +
            a[14] * b[10] +
            a[15] * b[14];
  res[15] = a[12] * b[3] +
            a[13] * b[7] +
            a[14] * b[11] +
            a[15] * b[15];

  return res;
};

snabbtjs.mat_to_css = function(matrix) {
  var s = 'matrix3d(';
  for(var i=0;i<matrix.length-1;++i) {
    if(Math.abs(matrix[i]) < 0.0001)
      s += "0,";
    else 
      s += matrix[i].toFixed(10) + ",";
  }
  if(Math.abs(matrix[15]) < 0.000001)
    s += "0)";
  else 
    s += matrix[15].toFixed(10) + ")";
  return s;
};

snabbtjs.mat_to_css2 = function(matrix) {
  var css = 'matrix3d(' +
            matrix[0].toFixed(10) + ', ' +
            matrix[1].toFixed(10) + ', ' +
            matrix[2].toFixed(10) + ', ' +
            matrix[3].toFixed(10) + ', ' +
            matrix[4].toFixed(10) + ', ' +
            matrix[5].toFixed(10) + ', ' +
            matrix[6].toFixed(10) + ', ' +
            matrix[7].toFixed(10) + ', ' +
            matrix[8].toFixed(10) + ', ' +
            matrix[9].toFixed(10) + ', ' +
            matrix[10].toFixed(10) + ', ' +
            matrix[11].toFixed(10) + ', ' +
            matrix[12].toFixed(10) + ', ' +
            matrix[13].toFixed(10) + ', ' +
            matrix[14].toFixed(10) + ', ' +
            matrix[15].toFixed(10) + ')';
  return css;
};

snabbtjs.mult = function(a, b) {
  var m = new Float32Array(16);
  snabbtjs.assigned_matrix_multiplication(a, b, m);
  return m;
};

snabbtjs.rotX = function(rad) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.assign_rotX = function(m, rad) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotY = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotY = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotZ = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotZ = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.trans = function(x, y, z) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.assign_trans = function(m, x, y, z) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.scale = function(x, y) {
  return new Float32Array([
     x, 0, 0, 0,
     0, y, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_scale = function(m, x, y) {
  m[0] = x; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = y; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.ident = function() {
  return new Float32Array([
     1, 0, 0, 0,
     0, 1, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_ident = function(m) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.set_css = function(el, state) {
  var matrix = state.as_matrix();
  if(el.hasOwnProperty('length')) {
    for(var i=0;i<el.length;++i) {
      el[i].style.webkitTransform = snabbtjs.mat_to_css(matrix);
      el[i].style.transform = snabbtjs.mat_to_css(matrix);
      if(state.width !== undefined)
        el[i].style.width = state.width + 'px';
      if(state.height !== undefined)
        el[i].style.height = state.height + 'px';
      if(state.opacity !== undefined)
        el[i].style.opacity = state.opacity;
    }
  } else {
    el.style.webkitTransform = snabbtjs.mat_to_css(matrix);
    el.style.transform = snabbtjs.mat_to_css(matrix);
      if(state.width !== undefined)
        el.style.width = state.width + 'px';
      if(state.height !== undefined)
        el.style.height = state.height + 'px';
      if(state.opacity !== undefined)
        el.style.opacity = state.opacity;
  }
};

;snabbtjs.State = function(config) {
  this.ax = config.ax || 0;
  this.ay = config.ay || 0;
  this.az = config.az || 0;
  this.x = config.x || 0;
  this.y = config.y || 0;
  this.z = config.z || 0;
  this.bx = config.bx || 0;
  this.by = config.by || 0;
  this.bz = config.bz || 0;
  this.offset_x = config.offset_x || 0;
  this.offset_y = config.offset_y || 0;
  this.offset_z = config.offset_z || 0;
  this.sx = config.sx || 1;
  this.sy = config.sy || 1;
  this.width = config.width;
  this.height = config.height;
  this.opacity = config.opacity;
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
    sx: this.sx,
    sy: this.sy,
    height: this.height,
    width: this.width,
    opacity: this.opacity
  });
  return p;
};

snabbtjs.State.prototype.assign = function(p) {
  this.ax = p.ax;
  this.ay = p.ay;
  this.az = p.az;
  this.x = p.x;
  this.y = p.y;
  this.z = p.z;
  this.bx = p.bx;
  this.by = p.by;
  this.bz = p.bz;
  this.sx = p.sx;
  this.sy = p.sy;
  this.opacity = p.opacity;
};

//  Reuse the same three matrices everytime.
var temp_m = snabbtjs.ident();
var temp_res1 = snabbtjs.ident();
var temp_res2 = snabbtjs.ident();

snabbtjs.State.prototype.as_matrix = function() {
  // Scale
  snabbtjs.assign_scale(temp_res1, this.sx, this.sy);

  // Pre-rotation
  snabbtjs.assign_rotX(temp_res2, this.ax);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_res2, temp_m);

  snabbtjs.assign_rotY(temp_res1, this.ay);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_m, temp_res2);
  snabbtjs.assign_rotZ(temp_m, this.az);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res2, temp_res1);

  // Translation
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_trans(temp_m, this.x, this.y, this.z), temp_res2);

  // Post-rotation
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotX(temp_m, this.bx), temp_res1);
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_rotY(temp_m, this.by), temp_res2);
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotZ(temp_m, this.bz), temp_res1);

  // Final offset
  snabbtjs.assign_trans(temp_m, this.offset_x, this.offset_y, this.offset_z);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res1, temp_res2);
  return temp_res2;
};

;var tick_requests = [];

function requestAnimFrame(func) {
  tick_requests.push(func);
}

function master_tick(time) {
  var length = tick_requests.length;
  for(var i=0;i<length;++i) {
    tick_requests[i](time);
  }
  tick_requests.splice(0, length);
  window.requestAnimationFrame(master_tick);
}

window.requestAnimationFrame(master_tick);

function state_from_options(p, options, prefix) {

  if(options[prefix + 'pos']) {
    p.x = options[prefix + 'pos'][0];
    p.y = options[prefix + 'pos'][1];
    p.z = options[prefix + 'pos'][2];
  }
  if(options[prefix + 'rot']) {
    p.ax =  options[prefix + 'rot'][0];
    p.ay =  options[prefix + 'rot'][1];
    p.az =  options[prefix + 'rot'][2];
  }
  if(options[prefix + 'rot_post']) {
    p.bx =  options[prefix + 'rot_post'][0];
    p.by =  options[prefix + 'rot_post'][1];
    p.bz =  options[prefix + 'rot_post'][2];
  }
  if(options[prefix + 'scale']) {
    p.sx =  options[prefix + 'scale'][0];
    p.sy =  options[prefix + 'scale'][1];
  }
  if(options[prefix + 'width'] !== undefined) {
    p.width =  options[prefix + 'width'];
  }
  if(options[prefix + 'height'] !== undefined) {
    p.height =  options[prefix + 'height'];
  }
  if(options[prefix + 'opacity'] !== undefined) {
    p.opacity =  options[prefix + 'opacity'];
  }
  return p;
}


function snabbt(e, options) {
  if(e == 'scroll') {
    return snabbtjs.setup_scroll_animation(options);
  }

  var start = new snabbtjs.State({});
  start = state_from_options(start, options, 'from_');
  var end = new snabbtjs.State({});
  end = state_from_options(end, options, '');

  var anim_options = {
    start_state: start,
    end_state: end,
    duration: options.duration || 1000,
    delay: options.delay || 0,
    offset: options.offset
  };
  if(options.easing)
    anim_options.easing = snabbtjs.EASING_FUNCS[options.easing];
  if(options.manual)
    anim_options.mode = snabbtjs.AnimationType.MANUAL;
  var animation = new snabbtjs.Animation(anim_options);

  var queue = [];
  var chainer = {
    then: function(opts) {
      queue.unshift(opts);
      return chainer;
    }
  };

  function tick(time) {
    animation.tick(time);
    var current_state = animation.current_state();
    snabbtjs.set_css(e, current_state);

    if(animation.completed()) {
      var end_state = animation.end_state();
      snabbtjs.set_css(e, end_state);

      if(options.loop > 1) {
        options.loop -= 1;
        animation.assign(anim_options);
        requestAnimFrame(tick);
      } else {
        if(options.callback) {
          options.callback();
        }
        if(queue.length) {
          options = queue.pop();

          start = state_from_options(end, options, 'from_');
          end = state_from_options(new snabbtjs.State({}), options, '');
          animation.assign({
            start_state: start,
            end_state: end,
            duration: options.duration || 1000,
            delay: options.delay || 0,
            offset: options.offset
          });
          if(options.easing)
            animation.easing = snabbtjs.EASING_FUNCS[options.easing];

          animation.tick(time);
          requestAnimFrame(tick);
        }
      }
    } else {
      requestAnimFrame(tick);
    }
  }

  requestAnimFrame(tick);
  if(options.manual) 
    return animation;
  else
    return chainer;
}

snabbtjs.setup_scroll_animation = function(options) {
  var animation = new snabbtjs.ScrollAnimation(options);

  function tick(time) {
    animation.tick(time);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  }
  requestAnimFrame(tick);
};

;var snabbtjs = snabbtjs || {};

snabbtjs.assigned_matrix_multiplication = function(a, b, res) {
  // Unrolled loop
  res[0] = a[0] * b[0] +
           a[1] * b[4] +
           a[2] * b[8] +
           a[3] * b[12];
  res[1] = a[0] * b[1] +
           a[1] * b[5] +
           a[2] * b[9] +
           a[3] * b[13];
  res[2] = a[0] * b[2] +
           a[1] * b[6] +
           a[2] * b[10] +
           a[3] * b[14];
  res[3] = a[0] * b[3] +
           a[1] * b[7] +
           a[2] * b[11] +
           a[3] * b[15];

  res[4] = a[4] * b[0] +
           a[5] * b[4] +
           a[6] * b[8] +
           a[7] * b[12];
  res[5] = a[4] * b[1] +
           a[5] * b[5] +
           a[6] * b[9] +
           a[7] * b[13];
  res[6] = a[4] * b[2] +
           a[5] * b[6] +
           a[6] * b[10] +
           a[7] * b[14];
  res[7] = a[4] * b[3] +
           a[5] * b[7] +
           a[6] * b[11] +
           a[7] * b[15];

  res[8] = a[8] * b[0] +
           a[9] * b[4] +
           a[10] * b[8] +
           a[11] * b[12];
  res[9] = a[8] * b[1] +
           a[9] * b[5] +
           a[10] * b[9] +
           a[11] * b[13];
  res[10] = a[8] * b[2] +
            a[9] * b[6] +
            a[10] * b[10] +
            a[11] * b[14];
  res[11] = a[8] * b[3] +
            a[9] * b[7] +
            a[10] * b[11] +
            a[11] * b[15];

  res[12] = a[12] * b[0] +
            a[13] * b[4] +
            a[14] * b[8] +
            a[15] * b[12];
  res[13] = a[12] * b[1] +
            a[13] * b[5] +
            a[14] * b[9] +
            a[15] * b[13];
  res[14] = a[12] * b[2] +
            a[13] * b[6] +
            a[14] * b[10] +
            a[15] * b[14];
  res[15] = a[12] * b[3] +
            a[13] * b[7] +
            a[14] * b[11] +
            a[15] * b[15];

  return res;
};

snabbtjs.mat_to_css = function(matrix) {
  var s = 'matrix3d(';
  for(var i=0;i<matrix.length-1;++i) {
    if(Math.abs(matrix[i]) < 0.0001)
      s += "0,";
    else 
      s += matrix[i].toFixed(10) + ",";
  }
  if(Math.abs(matrix[15]) < 0.000001)
    s += "0)";
  else 
    s += matrix[15].toFixed(10) + ")";
  return s;
};

snabbtjs.mat_to_css2 = function(matrix) {
  var css = 'matrix3d(' +
            matrix[0].toFixed(10) + ', ' +
            matrix[1].toFixed(10) + ', ' +
            matrix[2].toFixed(10) + ', ' +
            matrix[3].toFixed(10) + ', ' +
            matrix[4].toFixed(10) + ', ' +
            matrix[5].toFixed(10) + ', ' +
            matrix[6].toFixed(10) + ', ' +
            matrix[7].toFixed(10) + ', ' +
            matrix[8].toFixed(10) + ', ' +
            matrix[9].toFixed(10) + ', ' +
            matrix[10].toFixed(10) + ', ' +
            matrix[11].toFixed(10) + ', ' +
            matrix[12].toFixed(10) + ', ' +
            matrix[13].toFixed(10) + ', ' +
            matrix[14].toFixed(10) + ', ' +
            matrix[15].toFixed(10) + ')';
  return css;
};

snabbtjs.mult = function(a, b) {
  var m = new Float32Array(16);
  snabbtjs.assigned_matrix_multiplication(a, b, m);
  return m;
};

snabbtjs.rotX = function(rad) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.assign_rotX = function(m, rad) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotY = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotY = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotZ = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotZ = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.trans = function(x, y, z) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.assign_trans = function(m, x, y, z) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.scale = function(x, y) {
  return new Float32Array([
     x, 0, 0, 0,
     0, y, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_scale = function(m, x, y) {
  m[0] = x; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = y; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.ident = function() {
  return new Float32Array([
     1, 0, 0, 0,
     0, 1, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_ident = function(m) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.set_css = function(el, state) {
  var matrix = state.as_matrix();
  if(el.hasOwnProperty('length')) {
    for(var i=0;i<el.length;++i) {
      //el[i].style.webkitTransform = snabbtjs.mat_to_css(matrix);
      el[i].style.transform = snabbtjs.mat_to_css(matrix);
      if(state.width !== undefined)
        el[i].style.width = state.width + 'px';
      if(state.height !== undefined)
        el[i].style.height = state.height + 'px';
      if(state.opacity !== undefined)
        el[i].style.opacity = state.opacity;
    }
  } else {
    //el.style.webkitTransform = snabbtjs.mat_to_css(matrix);
    el.style.transform = snabbtjs.mat_to_css(matrix);
      if(state.width !== undefined)
        el.style.width = state.width + 'px';
      if(state.height !== undefined)
        el.style.height = state.height + 'px';
      if(state.opacity !== undefined)
        el.style.opacity = state.opacity;
  }
};

;snabbtjs.State = function(config) {
  this.ax = config.ax || 0;
  this.ay = config.ay || 0;
  this.az = config.az || 0;
  this.x = config.x || 0;
  this.y = config.y || 0;
  this.z = config.z || 0;
  this.bx = config.bx || 0;
  this.by = config.by || 0;
  this.bz = config.bz || 0;
  this.offset_x = config.offset_x || 0;
  this.offset_y = config.offset_y || 0;
  this.offset_z = config.offset_z || 0;
  this.sx = config.sx || 1;
  this.sy = config.sy || 1;
  this.width = config.width;
  this.height = config.height;
  this.opacity = config.opacity;
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
    sx: this.sx,
    sy: this.sy,
    height: this.height,
    width: this.width,
    opacity: this.opacity
  });
  return p;
};

snabbtjs.State.prototype.assign = function(p) {
  this.ax = p.ax;
  this.ay = p.ay;
  this.az = p.az;
  this.x = p.x;
  this.y = p.y;
  this.z = p.z;
  this.bx = p.bx;
  this.by = p.by;
  this.bz = p.bz;
  this.sx = p.sx;
  this.sy = p.sy;
  this.opacity = p.opacity;
};

//  Reuse the same three matrices everytime.
var temp_m = snabbtjs.ident();
var temp_res1 = snabbtjs.ident();
var temp_res2 = snabbtjs.ident();

snabbtjs.State.prototype.as_matrix = function() {
  // Scale
  snabbtjs.assign_scale(temp_res1, this.sx, this.sy);

  // Pre-rotation
  snabbtjs.assign_rotX(temp_res2, this.ax);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_res2, temp_m);

  snabbtjs.assign_rotY(temp_res1, this.ay);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_m, temp_res2);
  snabbtjs.assign_rotZ(temp_m, this.az);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res2, temp_res1);

  // Translation
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_trans(temp_m, this.x, this.y, this.z), temp_res2);

  // Post-rotation
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotX(temp_m, this.bx), temp_res1);
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_rotY(temp_m, this.by), temp_res2);
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotZ(temp_m, this.bz), temp_res1);

  // Final offset
  snabbtjs.assign_trans(temp_m, this.offset_x, this.offset_y, this.offset_z);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res1, temp_res2);
  return temp_res2;
};

;var tick_requests = [];

function requestAnimFrame(func) {
  tick_requests.push(func);
}

function master_tick(time) {
  var length = tick_requests.length;
  for(var i=0;i<length;++i) {
    tick_requests[i](time);
  }
  tick_requests.splice(0, length);
  window.requestAnimationFrame(master_tick);
}

window.requestAnimationFrame(master_tick);

function state_from_options(p, options, prefix) {

  if(options[prefix + 'pos']) {
    p.x = options[prefix + 'pos'][0];
    p.y = options[prefix + 'pos'][1];
    p.z = options[prefix + 'pos'][2];
  }
  if(options[prefix + 'rot']) {
    p.ax =  options[prefix + 'rot'][0];
    p.ay =  options[prefix + 'rot'][1];
    p.az =  options[prefix + 'rot'][2];
  }
  if(options[prefix + 'rot_post']) {
    p.bx =  options[prefix + 'rot_post'][0];
    p.by =  options[prefix + 'rot_post'][1];
    p.bz =  options[prefix + 'rot_post'][2];
  }
  if(options[prefix + 'scale']) {
    p.sx =  options[prefix + 'scale'][0];
    p.sy =  options[prefix + 'scale'][1];
  }
  if(options[prefix + 'width'] !== undefined) {
    p.width =  options[prefix + 'width'];
  }
  if(options[prefix + 'height'] !== undefined) {
    p.height =  options[prefix + 'height'];
  }
  if(options[prefix + 'opacity'] !== undefined) {
    p.opacity =  options[prefix + 'opacity'];
  }
  return p;
}


function snabbt(e, options) {
  if(e == 'scroll') {
    return snabbtjs.setup_scroll_animation(options);
  }

  var start = new snabbtjs.State({});
  start = state_from_options(start, options, 'from_');
  var end = new snabbtjs.State({});
  end = state_from_options(end, options, '');

  var anim_options = {
    start_state: start,
    end_state: end,
    duration: options.duration || 1000,
    delay: options.delay || 0,
    offset: options.offset
  };
  if(options.easing)
    anim_options.easing = snabbtjs.EASING_FUNCS[options.easing];
  if(options.manual)
    anim_options.mode = snabbtjs.AnimationType.MANUAL;
  var animation = new snabbtjs.Animation(anim_options);

  var queue = [];
  var chainer = {
    then: function(opts) {
      queue.unshift(opts);
      return chainer;
    }
  };

  function tick(time) {
    animation.tick(time);
    var current_state = animation.current_state();
    snabbtjs.set_css(e, current_state);

    if(animation.completed()) {
      var end_state = animation.end_state();
      snabbtjs.set_css(e, end_state);

      if(options.loop > 1) {
        options.loop -= 1;
        animation.assign(anim_options);
        requestAnimFrame(tick);
      } else {
        if(options.callback) {
          options.callback();
        }
        if(queue.length) {
          options = queue.pop();

          start = state_from_options(end, options, 'from_');
          end = state_from_options(new snabbtjs.State({}), options, '');
          animation.assign({
            start_state: start,
            end_state: end,
            duration: options.duration || 1000,
            delay: options.delay || 0,
            offset: options.offset
          });
          if(options.easing)
            animation.easing = snabbtjs.EASING_FUNCS[options.easing];

          animation.tick(time);
          requestAnimFrame(tick);
        }
      }
    } else {
      requestAnimFrame(tick);
    }
  }

  requestAnimFrame(tick);
  if(options.manual) 
    return animation;
  else
    return chainer;
}

snabbtjs.setup_scroll_animation = function(options) {
  var animation = new snabbtjs.ScrollAnimation(options);

  function tick(time) {
    animation.tick(time);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  }
  requestAnimFrame(tick);
};

;var snabbtjs = snabbtjs || {};

snabbtjs.assigned_matrix_multiplication = function(a, b, res) {
  // Unrolled loop
  res[0] = a[0] * b[0] +
           a[1] * b[4] +
           a[2] * b[8] +
           a[3] * b[12];
  res[1] = a[0] * b[1] +
           a[1] * b[5] +
           a[2] * b[9] +
           a[3] * b[13];
  res[2] = a[0] * b[2] +
           a[1] * b[6] +
           a[2] * b[10] +
           a[3] * b[14];
  res[3] = a[0] * b[3] +
           a[1] * b[7] +
           a[2] * b[11] +
           a[3] * b[15];

  res[4] = a[4] * b[0] +
           a[5] * b[4] +
           a[6] * b[8] +
           a[7] * b[12];
  res[5] = a[4] * b[1] +
           a[5] * b[5] +
           a[6] * b[9] +
           a[7] * b[13];
  res[6] = a[4] * b[2] +
           a[5] * b[6] +
           a[6] * b[10] +
           a[7] * b[14];
  res[7] = a[4] * b[3] +
           a[5] * b[7] +
           a[6] * b[11] +
           a[7] * b[15];

  res[8] = a[8] * b[0] +
           a[9] * b[4] +
           a[10] * b[8] +
           a[11] * b[12];
  res[9] = a[8] * b[1] +
           a[9] * b[5] +
           a[10] * b[9] +
           a[11] * b[13];
  res[10] = a[8] * b[2] +
            a[9] * b[6] +
            a[10] * b[10] +
            a[11] * b[14];
  res[11] = a[8] * b[3] +
            a[9] * b[7] +
            a[10] * b[11] +
            a[11] * b[15];

  res[12] = a[12] * b[0] +
            a[13] * b[4] +
            a[14] * b[8] +
            a[15] * b[12];
  res[13] = a[12] * b[1] +
            a[13] * b[5] +
            a[14] * b[9] +
            a[15] * b[13];
  res[14] = a[12] * b[2] +
            a[13] * b[6] +
            a[14] * b[10] +
            a[15] * b[14];
  res[15] = a[12] * b[3] +
            a[13] * b[7] +
            a[14] * b[11] +
            a[15] * b[15];

  return res;
};

snabbtjs.mat_to_css = function(matrix) {
  var s = 'matrix3d(';
  for(var i=0;i<matrix.length-1;++i) {
    if(Math.abs(matrix[i]) < 0.0001)
      s += "0,";
    else 
      s += matrix[i].toFixed(10) + ",";
  }
  if(Math.abs(matrix[15]) < 0.000001)
    s += "0)";
  else 
    s += matrix[15].toFixed(10) + ")";
  return s;
};

snabbtjs.mat_to_css2 = function(matrix) {
  var css = 'matrix3d(' +
            matrix[0].toFixed(10) + ', ' +
            matrix[1].toFixed(10) + ', ' +
            matrix[2].toFixed(10) + ', ' +
            matrix[3].toFixed(10) + ', ' +
            matrix[4].toFixed(10) + ', ' +
            matrix[5].toFixed(10) + ', ' +
            matrix[6].toFixed(10) + ', ' +
            matrix[7].toFixed(10) + ', ' +
            matrix[8].toFixed(10) + ', ' +
            matrix[9].toFixed(10) + ', ' +
            matrix[10].toFixed(10) + ', ' +
            matrix[11].toFixed(10) + ', ' +
            matrix[12].toFixed(10) + ', ' +
            matrix[13].toFixed(10) + ', ' +
            matrix[14].toFixed(10) + ', ' +
            matrix[15].toFixed(10) + ')';
  return css;
};

snabbtjs.mult = function(a, b) {
  var m = new Float32Array(16);
  snabbtjs.assigned_matrix_multiplication(a, b, m);
  return m;
};

snabbtjs.rotX = function(rad) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.assign_rotX = function(m, rad) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotY = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotY = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotZ = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotZ = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.trans = function(x, y, z) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.assign_trans = function(m, x, y, z) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.scale = function(x, y) {
  return new Float32Array([
     x, 0, 0, 0,
     0, y, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_scale = function(m, x, y) {
  m[0] = x; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = y; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.ident = function() {
  return new Float32Array([
     1, 0, 0, 0,
     0, 1, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_ident = function(m) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.set_css = function(el, state) {
  var matrix = state.as_matrix();
  if(el.hasOwnProperty('length')) {
    for(var i=0;i<el.length;++i) {
      el[i].style.webkitTransform = snabbtjs.mat_to_css(matrix);
      el[i].style.transform = snabbtjs.mat_to_css(matrix);
      if(state.width !== undefined)
        el[i].style.width = state.width + 'px';
      if(state.height !== undefined)
        el[i].style.height = state.height + 'px';
      if(state.opacity !== undefined)
        el[i].style.opacity = state.opacity;
    }
  } else {
    el.style.webkitTransform = snabbtjs.mat_to_css(matrix);
    el.style.transform = snabbtjs.mat_to_css(matrix);
      if(state.width !== undefined)
        el.style.width = state.width + 'px';
      if(state.height !== undefined)
        el.style.height = state.height + 'px';
      if(state.opacity !== undefined)
        el.style.opacity = state.opacity;
  }
};

;snabbtjs.State = function(config) {
  this.ax = config.ax || 0;
  this.ay = config.ay || 0;
  this.az = config.az || 0;
  this.x = config.x || 0;
  this.y = config.y || 0;
  this.z = config.z || 0;
  this.bx = config.bx || 0;
  this.by = config.by || 0;
  this.bz = config.bz || 0;
  this.offset_x = config.offset_x || 0;
  this.offset_y = config.offset_y || 0;
  this.offset_z = config.offset_z || 0;
  this.sx = config.sx || 1;
  this.sy = config.sy || 1;
  this.width = config.width;
  this.height = config.height;
  this.opacity = config.opacity;
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
    sx: this.sx,
    sy: this.sy,
    height: this.height,
    width: this.width,
    opacity: this.opacity
  });
  return p;
};

snabbtjs.State.prototype.assign = function(p) {
  this.ax = p.ax;
  this.ay = p.ay;
  this.az = p.az;
  this.x = p.x;
  this.y = p.y;
  this.z = p.z;
  this.bx = p.bx;
  this.by = p.by;
  this.bz = p.bz;
  this.sx = p.sx;
  this.sy = p.sy;
  this.opacity = p.opacity;
};

//  Reuse the same three matrices everytime.
var temp_m = snabbtjs.ident();
var temp_res1 = snabbtjs.ident();
var temp_res2 = snabbtjs.ident();

snabbtjs.State.prototype.as_matrix = function() {
  // Scale
  snabbtjs.assign_scale(temp_res1, this.sx, this.sy);

  // Pre-rotation
  snabbtjs.assign_rotX(temp_res2, this.ax);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_res2, temp_m);

  snabbtjs.assign_rotY(temp_res1, this.ay);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_m, temp_res2);
  snabbtjs.assign_rotZ(temp_m, this.az);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res2, temp_res1);

  // Translation
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_trans(temp_m, this.x, this.y, this.z), temp_res2);

  // Post-rotation
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotX(temp_m, this.bx), temp_res1);
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_rotY(temp_m, this.by), temp_res2);
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotZ(temp_m, this.bz), temp_res1);

  // Final offset
  snabbtjs.assign_trans(temp_m, this.offset_x, this.offset_y, this.offset_z);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res1, temp_res2);
  return temp_res2;
};

;var tick_requests = [];

function requestAnimFrame(func) {
  tick_requests.push(func);
}

function master_tick(time) {
  var length = tick_requests.length;
  for(var i=0;i<length;++i) {
    tick_requests[i](time);
  }
  tick_requests.splice(0, length);
  window.requestAnimationFrame(master_tick);
}

window.requestAnimationFrame(master_tick);

function state_from_options(p, options, prefix) {

  if(options[prefix + 'pos']) {
    p.x = options[prefix + 'pos'][0];
    p.y = options[prefix + 'pos'][1];
    p.z = options[prefix + 'pos'][2];
  }
  if(options[prefix + 'rot']) {
    p.ax =  options[prefix + 'rot'][0];
    p.ay =  options[prefix + 'rot'][1];
    p.az =  options[prefix + 'rot'][2];
  }
  if(options[prefix + 'rot_post']) {
    p.bx =  options[prefix + 'rot_post'][0];
    p.by =  options[prefix + 'rot_post'][1];
    p.bz =  options[prefix + 'rot_post'][2];
  }
  if(options[prefix + 'scale']) {
    p.sx =  options[prefix + 'scale'][0];
    p.sy =  options[prefix + 'scale'][1];
  }
  if(options[prefix + 'width'] !== undefined) {
    p.width =  options[prefix + 'width'];
  }
  if(options[prefix + 'height'] !== undefined) {
    p.height =  options[prefix + 'height'];
  }
  if(options[prefix + 'opacity'] !== undefined) {
    p.opacity =  options[prefix + 'opacity'];
  }
  return p;
}


function snabbt(e, options) {
  if(e == 'scroll') {
    return snabbtjs.setup_scroll_animation(options);
  }

  var start = new snabbtjs.State({});
  start = state_from_options(start, options, 'from_');
  var end = new snabbtjs.State({});
  end = state_from_options(end, options, '');

  var anim_options = {
    start_state: start,
    end_state: end,
    duration: options.duration || 1000,
    delay: options.delay || 0,
    offset: options.offset
  };
  if(options.easing)
    anim_options.easing = snabbtjs.EASING_FUNCS[options.easing];
  if(options.manual)
    anim_options.mode = snabbtjs.AnimationType.MANUAL;
  var animation = new snabbtjs.Animation(anim_options);

  var queue = [];
  var chainer = {
    then: function(opts) {
      queue.unshift(opts);
      return chainer;
    }
  };

  function tick(time) {
    animation.tick(time);
    var current_state = animation.current_state();
    snabbtjs.set_css(e, current_state);

    if(animation.completed()) {
      var end_state = animation.end_state();
      snabbtjs.set_css(e, end_state);

      if(options.loop > 1) {
        options.loop -= 1;
        animation.assign(anim_options);
        requestAnimFrame(tick);
      } else {
        if(options.callback) {
          options.callback();
        }
        if(queue.length) {
          options = queue.pop();

          start = state_from_options(end, options, 'from_');
          end = state_from_options(new snabbtjs.State({}), options, '');
          animation.assign({
            start_state: start,
            end_state: end,
            duration: options.duration || 1000,
            delay: options.delay || 0,
            offset: options.offset
          });
          if(options.easing)
            animation.easing = snabbtjs.EASING_FUNCS[options.easing];

          animation.tick(time);
          requestAnimFrame(tick);
        }
      }
    } else {
      requestAnimFrame(tick);
    }
  }

  requestAnimFrame(tick);
  if(options.manual) 
    return animation;
  else
    return chainer;
}

snabbtjs.setup_scroll_animation = function(options) {
  var animation = new snabbtjs.ScrollAnimation(options);

  function tick(time) {
    animation.tick(time);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  }
  requestAnimFrame(tick);
};

;var snabbtjs = snabbtjs || {};

snabbtjs.assigned_matrix_multiplication = function(a, b, res) {
  // Unrolled loop
  res[0] = a[0] * b[0] +
           a[1] * b[4] +
           a[2] * b[8] +
           a[3] * b[12];
  res[1] = a[0] * b[1] +
           a[1] * b[5] +
           a[2] * b[9] +
           a[3] * b[13];
  res[2] = a[0] * b[2] +
           a[1] * b[6] +
           a[2] * b[10] +
           a[3] * b[14];
  res[3] = a[0] * b[3] +
           a[1] * b[7] +
           a[2] * b[11] +
           a[3] * b[15];

  res[4] = a[4] * b[0] +
           a[5] * b[4] +
           a[6] * b[8] +
           a[7] * b[12];
  res[5] = a[4] * b[1] +
           a[5] * b[5] +
           a[6] * b[9] +
           a[7] * b[13];
  res[6] = a[4] * b[2] +
           a[5] * b[6] +
           a[6] * b[10] +
           a[7] * b[14];
  res[7] = a[4] * b[3] +
           a[5] * b[7] +
           a[6] * b[11] +
           a[7] * b[15];

  res[8] = a[8] * b[0] +
           a[9] * b[4] +
           a[10] * b[8] +
           a[11] * b[12];
  res[9] = a[8] * b[1] +
           a[9] * b[5] +
           a[10] * b[9] +
           a[11] * b[13];
  res[10] = a[8] * b[2] +
            a[9] * b[6] +
            a[10] * b[10] +
            a[11] * b[14];
  res[11] = a[8] * b[3] +
            a[9] * b[7] +
            a[10] * b[11] +
            a[11] * b[15];

  res[12] = a[12] * b[0] +
            a[13] * b[4] +
            a[14] * b[8] +
            a[15] * b[12];
  res[13] = a[12] * b[1] +
            a[13] * b[5] +
            a[14] * b[9] +
            a[15] * b[13];
  res[14] = a[12] * b[2] +
            a[13] * b[6] +
            a[14] * b[10] +
            a[15] * b[14];
  res[15] = a[12] * b[3] +
            a[13] * b[7] +
            a[14] * b[11] +
            a[15] * b[15];

  return res;
};

snabbtjs.mat_to_css = function(matrix) {
  var s = 'matrix3d(';
  for(var i=0;i<matrix.length-1;++i) {
    if(Math.abs(matrix[i]) < 0.000001)
      s += "0,";
    else 
      s += matrix[i].toFixed(10) + ",";
  }
  if(Math.abs(matrix[15]) < 0.000001)
    s += "0)";
  else 
    s += matrix[15].toFixed(10) + ")";
  return s;
};

snabbtjs.mat_to_css2 = function(matrix) {
  var css = 'matrix3d(' +
            matrix[0].toFixed(10) + ', ' +
            matrix[1].toFixed(10) + ', ' +
            matrix[2].toFixed(10) + ', ' +
            matrix[3].toFixed(10) + ', ' +
            matrix[4].toFixed(10) + ', ' +
            matrix[5].toFixed(10) + ', ' +
            matrix[6].toFixed(10) + ', ' +
            matrix[7].toFixed(10) + ', ' +
            matrix[8].toFixed(10) + ', ' +
            matrix[9].toFixed(10) + ', ' +
            matrix[10].toFixed(10) + ', ' +
            matrix[11].toFixed(10) + ', ' +
            matrix[12].toFixed(10) + ', ' +
            matrix[13].toFixed(10) + ', ' +
            matrix[14].toFixed(10) + ', ' +
            matrix[15].toFixed(10) + ')';
  return css;
};

snabbtjs.mult = function(a, b) {
  var m = new Float32Array(16);
  snabbtjs.assigned_matrix_multiplication(a, b, m);
  return m;
};

snabbtjs.rotX = function(rad) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.assign_rotX = function(m, rad) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotY = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotY = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotZ = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotZ = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.trans = function(x, y, z) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.assign_trans = function(m, x, y, z) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.scale = function(x, y) {
  return new Float32Array([
     x, 0, 0, 0,
     0, y, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_scale = function(m, x, y) {
  m[0] = x; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = y; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.ident = function() {
  return new Float32Array([
     1, 0, 0, 0,
     0, 1, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_ident = function(m) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.set_css = function(el, state) {
  var matrix = state.as_matrix();
  if(el.hasOwnProperty('length')) {
    for(var i=0;i<el.length;++i) {
      el[i].style.webkitTransform = snabbtjs.mat_to_css(matrix);
      el[i].style.transform = snabbtjs.mat_to_css(matrix);
      if(state.width !== undefined)
        el[i].style.width = state.width + 'px';
      if(state.height !== undefined)
        el[i].style.height = state.height + 'px';
      if(state.opacity !== undefined)
        el[i].style.opacity = state.opacity;
    }
  } else {
    el.style.webkitTransform = snabbtjs.mat_to_css(matrix);
    el.style.transform = snabbtjs.mat_to_css(matrix);
      if(state.width !== undefined)
        el.style.width = state.width + 'px';
      if(state.height !== undefined)
        el.style.height = state.height + 'px';
      if(state.opacity !== undefined)
        el.style.opacity = state.opacity;
  }
};

;snabbtjs.State = function(config) {
  this.ax = config.ax || 0;
  this.ay = config.ay || 0;
  this.az = config.az || 0;
  this.x = config.x || 0;
  this.y = config.y || 0;
  this.z = config.z || 0;
  this.bx = config.bx || 0;
  this.by = config.by || 0;
  this.bz = config.bz || 0;
  this.offset_x = config.offset_x || 0;
  this.offset_y = config.offset_y || 0;
  this.offset_z = config.offset_z || 0;
  this.sx = config.sx || 1;
  this.sy = config.sy || 1;
  this.width = config.width;
  this.height = config.height;
  this.opacity = config.opacity;
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
    sx: this.sx,
    sy: this.sy,
    height: this.height,
    width: this.width,
    opacity: this.opacity
  });
  return p;
};

snabbtjs.State.prototype.assign = function(p) {
  this.ax = p.ax;
  this.ay = p.ay;
  this.az = p.az;
  this.x = p.x;
  this.y = p.y;
  this.z = p.z;
  this.bx = p.bx;
  this.by = p.by;
  this.bz = p.bz;
  this.sx = p.sx;
  this.sy = p.sy;
  this.opacity = p.opacity;
};

//  Reuse the same three matrices everytime.
var temp_m = snabbtjs.ident();
var temp_res1 = snabbtjs.ident();
var temp_res2 = snabbtjs.ident();

snabbtjs.State.prototype.as_matrix = function() {
  // Scale
  snabbtjs.assign_scale(temp_res1, this.sx, this.sy);

  // Pre-rotation
  snabbtjs.assign_rotX(temp_res2, this.ax);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_res2, temp_m);

  snabbtjs.assign_rotY(temp_res1, this.ay);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_m, temp_res2);
  snabbtjs.assign_rotZ(temp_m, this.az);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res2, temp_res1);

  // Translation
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_trans(temp_m, this.x, this.y, this.z), temp_res2);

  // Post-rotation
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotX(temp_m, this.bx), temp_res1);
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_rotY(temp_m, this.by), temp_res2);
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotZ(temp_m, this.bz), temp_res1);

  // Final offset
  snabbtjs.assign_trans(temp_m, this.offset_x, this.offset_y, this.offset_z);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res1, temp_res2);
  return temp_res2;
};

;var tick_requests = [];

function requestAnimFrame(func) {
  tick_requests.push(func);
}

function master_tick(time) {
  var length = tick_requests.length;
  for(var i=0;i<length;++i) {
    tick_requests[i](time);
  }
  tick_requests.splice(0, length);
  window.requestAnimationFrame(master_tick);
}

window.requestAnimationFrame(master_tick);

function state_from_options(p, options, prefix) {

  if(options[prefix + 'pos']) {
    p.x = options[prefix + 'pos'][0];
    p.y = options[prefix + 'pos'][1];
    p.z = options[prefix + 'pos'][2];
  }
  if(options[prefix + 'rot']) {
    p.ax =  options[prefix + 'rot'][0];
    p.ay =  options[prefix + 'rot'][1];
    p.az =  options[prefix + 'rot'][2];
  }
  if(options[prefix + 'rot_post']) {
    p.bx =  options[prefix + 'rot_post'][0];
    p.by =  options[prefix + 'rot_post'][1];
    p.bz =  options[prefix + 'rot_post'][2];
  }
  if(options[prefix + 'scale']) {
    p.sx =  options[prefix + 'scale'][0];
    p.sy =  options[prefix + 'scale'][1];
  }
  if(options[prefix + 'width'] !== undefined) {
    p.width =  options[prefix + 'width'];
  }
  if(options[prefix + 'height'] !== undefined) {
    p.height =  options[prefix + 'height'];
  }
  if(options[prefix + 'opacity'] !== undefined) {
    p.opacity =  options[prefix + 'opacity'];
  }
  return p;
}


function snabbt(e, options) {
  if(e == 'scroll') {
    return snabbtjs.setup_scroll_animation(options);
  }

  var start = new snabbtjs.State({});
  start = state_from_options(start, options, 'from_');
  var end = new snabbtjs.State({});
  end = state_from_options(end, options, '');

  var anim_options = {
    start_state: start,
    end_state: end,
    duration: options.duration || 1000,
    delay: options.delay || 0,
    offset: options.offset
  };
  if(options.easing)
    anim_options.easing = snabbtjs.EASING_FUNCS[options.easing];
  if(options.manual)
    anim_options.mode = snabbtjs.AnimationType.MANUAL;
  var animation = new snabbtjs.Animation(anim_options);

  var queue = [];
  var chainer = {
    then: function(opts) {
      queue.unshift(opts);
      return chainer;
    }
  };

  function tick(time) {
    animation.tick(time);
    var current_state = animation.current_state();
    snabbtjs.set_css(e, current_state);

    if(animation.completed()) {
      var end_state = animation.end_state();
      snabbtjs.set_css(e, end_state);

      if(options.loop > 1) {
        options.loop -= 1;
        animation.assign(anim_options);
        requestAnimFrame(tick);
      } else {
        if(options.callback) {
          options.callback();
        }
        if(queue.length) {
          options = queue.pop();

          start = state_from_options(end, options, 'from_');
          end = state_from_options(new snabbtjs.State({}), options, '');
          animation.assign({
            start_state: start,
            end_state: end,
            duration: options.duration || 1000,
            delay: options.delay || 0,
            offset: options.offset
          });
          if(options.easing)
            animation.easing = snabbtjs.EASING_FUNCS[options.easing];

          animation.tick(time);
          requestAnimFrame(tick);
        }
      }
    } else {
      requestAnimFrame(tick);
    }
  }

  requestAnimFrame(tick);
  if(options.manual) 
    return animation;
  else
    return chainer;
}

snabbtjs.setup_scroll_animation = function(options) {
  var animation = new snabbtjs.ScrollAnimation(options);

  function tick(time) {
    animation.tick(time);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  }
  requestAnimFrame(tick);
};

;var snabbtjs = snabbtjs || {};

snabbtjs.assigned_matrix_multiplication = function(a, b, res) {
  // Unrolled loop
  res[0] = a[0] * b[0] +
           a[1] * b[4] +
           a[2] * b[8] +
           a[3] * b[12];
  res[1] = a[0] * b[1] +
           a[1] * b[5] +
           a[2] * b[9] +
           a[3] * b[13];
  res[2] = a[0] * b[2] +
           a[1] * b[6] +
           a[2] * b[10] +
           a[3] * b[14];
  res[3] = a[0] * b[3] +
           a[1] * b[7] +
           a[2] * b[11] +
           a[3] * b[15];

  res[4] = a[4] * b[0] +
           a[5] * b[4] +
           a[6] * b[8] +
           a[7] * b[12];
  res[5] = a[4] * b[1] +
           a[5] * b[5] +
           a[6] * b[9] +
           a[7] * b[13];
  res[6] = a[4] * b[2] +
           a[5] * b[6] +
           a[6] * b[10] +
           a[7] * b[14];
  res[7] = a[4] * b[3] +
           a[5] * b[7] +
           a[6] * b[11] +
           a[7] * b[15];

  res[8] = a[8] * b[0] +
           a[9] * b[4] +
           a[10] * b[8] +
           a[11] * b[12];
  res[9] = a[8] * b[1] +
           a[9] * b[5] +
           a[10] * b[9] +
           a[11] * b[13];
  res[10] = a[8] * b[2] +
            a[9] * b[6] +
            a[10] * b[10] +
            a[11] * b[14];
  res[11] = a[8] * b[3] +
            a[9] * b[7] +
            a[10] * b[11] +
            a[11] * b[15];

  res[12] = a[12] * b[0] +
            a[13] * b[4] +
            a[14] * b[8] +
            a[15] * b[12];
  res[13] = a[12] * b[1] +
            a[13] * b[5] +
            a[14] * b[9] +
            a[15] * b[13];
  res[14] = a[12] * b[2] +
            a[13] * b[6] +
            a[14] * b[10] +
            a[15] * b[14];
  res[15] = a[12] * b[3] +
            a[13] * b[7] +
            a[14] * b[11] +
            a[15] * b[15];

  return res;
};

snabbtjs.mat_to_css = function(matrix) {
  var s = 'matrix3d(';
  for(var i=0;i<matrix.length-1;++i) {
    //if(Math.abs(matrix[i]) < 0.000001)
    //  s += "0,";
    //else 
      s += matrix[i].toFixed(10) + ",";
  }
  //if(Math.abs(matrix[15]) < 0.000001)
  //  s += "0)";
  //else 
    s += matrix[15].toFixed(10) + ")";
  return s;
};

snabbtjs.mat_to_css2 = function(matrix) {
  var css = 'matrix3d(' +
            matrix[0].toFixed(10) + ', ' +
            matrix[1].toFixed(10) + ', ' +
            matrix[2].toFixed(10) + ', ' +
            matrix[3].toFixed(10) + ', ' +
            matrix[4].toFixed(10) + ', ' +
            matrix[5].toFixed(10) + ', ' +
            matrix[6].toFixed(10) + ', ' +
            matrix[7].toFixed(10) + ', ' +
            matrix[8].toFixed(10) + ', ' +
            matrix[9].toFixed(10) + ', ' +
            matrix[10].toFixed(10) + ', ' +
            matrix[11].toFixed(10) + ', ' +
            matrix[12].toFixed(10) + ', ' +
            matrix[13].toFixed(10) + ', ' +
            matrix[14].toFixed(10) + ', ' +
            matrix[15].toFixed(10) + ')';
  return css;
};

snabbtjs.mult = function(a, b) {
  var m = new Float32Array(16);
  snabbtjs.assigned_matrix_multiplication(a, b, m);
  return m;
};

snabbtjs.rotX = function(rad) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.assign_rotX = function(m, rad) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotY = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotY = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotZ = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotZ = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.trans = function(x, y, z) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.assign_trans = function(m, x, y, z) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.scale = function(x, y) {
  return new Float32Array([
     x, 0, 0, 0,
     0, y, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_scale = function(m, x, y) {
  m[0] = x; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = y; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.ident = function() {
  return new Float32Array([
     1, 0, 0, 0,
     0, 1, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_ident = function(m) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.set_css = function(el, state) {
  var matrix = state.as_matrix();
  if(el.hasOwnProperty('length')) {
    for(var i=0;i<el.length;++i) {
      el[i].style.webkitTransform = snabbtjs.mat_to_css(matrix);
      el[i].style.transform = snabbtjs.mat_to_css(matrix);
      if(state.width !== undefined)
        el[i].style.width = state.width + 'px';
      if(state.height !== undefined)
        el[i].style.height = state.height + 'px';
      if(state.opacity !== undefined)
        el[i].style.opacity = state.opacity;
    }
  } else {
    el.style.webkitTransform = snabbtjs.mat_to_css(matrix);
    el.style.transform = snabbtjs.mat_to_css(matrix);
      if(state.width !== undefined)
        el.style.width = state.width + 'px';
      if(state.height !== undefined)
        el.style.height = state.height + 'px';
      if(state.opacity !== undefined)
        el.style.opacity = state.opacity;
  }
};

;snabbtjs.State = function(config) {
  this.ax = config.ax || 0;
  this.ay = config.ay || 0;
  this.az = config.az || 0;
  this.x = config.x || 0;
  this.y = config.y || 0;
  this.z = config.z || 0;
  this.bx = config.bx || 0;
  this.by = config.by || 0;
  this.bz = config.bz || 0;
  this.offset_x = config.offset_x || 0;
  this.offset_y = config.offset_y || 0;
  this.offset_z = config.offset_z || 0;
  this.sx = config.sx || 1;
  this.sy = config.sy || 1;
  this.width = config.width;
  this.height = config.height;
  this.opacity = config.opacity;
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
    sx: this.sx,
    sy: this.sy,
    height: this.height,
    width: this.width,
    opacity: this.opacity
  });
  return p;
};

snabbtjs.State.prototype.assign = function(p) {
  this.ax = p.ax;
  this.ay = p.ay;
  this.az = p.az;
  this.x = p.x;
  this.y = p.y;
  this.z = p.z;
  this.bx = p.bx;
  this.by = p.by;
  this.bz = p.bz;
  this.sx = p.sx;
  this.sy = p.sy;
  this.opacity = p.opacity;
};

//  Reuse the same three matrices everytime.
var temp_m = snabbtjs.ident();
var temp_res1 = snabbtjs.ident();
var temp_res2 = snabbtjs.ident();

snabbtjs.State.prototype.as_matrix = function() {
  // Scale
  snabbtjs.assign_scale(temp_res1, this.sx, this.sy);

  // Pre-rotation
  snabbtjs.assign_rotX(temp_res2, this.ax);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_res2, temp_m);

  snabbtjs.assign_rotY(temp_res1, this.ay);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_m, temp_res2);
  snabbtjs.assign_rotZ(temp_m, this.az);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res2, temp_res1);

  // Translation
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_trans(temp_m, this.x, this.y, this.z), temp_res2);

  // Post-rotation
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotX(temp_m, this.bx), temp_res1);
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_rotY(temp_m, this.by), temp_res2);
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotZ(temp_m, this.bz), temp_res1);

  // Final offset
  snabbtjs.assign_trans(temp_m, this.offset_x, this.offset_y, this.offset_z);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res1, temp_res2);
  return temp_res2;
};

;var tick_requests = [];

function requestAnimFrame(func) {
  tick_requests.push(func);
}

function master_tick(time) {
  var length = tick_requests.length;
  for(var i=0;i<length;++i) {
    tick_requests[i](time);
  }
  tick_requests.splice(0, length);
  window.requestAnimationFrame(master_tick);
}

window.requestAnimationFrame(master_tick);

function state_from_options(p, options, prefix) {

  if(options[prefix + 'pos']) {
    p.x = options[prefix + 'pos'][0];
    p.y = options[prefix + 'pos'][1];
    p.z = options[prefix + 'pos'][2];
  }
  if(options[prefix + 'rot']) {
    p.ax =  options[prefix + 'rot'][0];
    p.ay =  options[prefix + 'rot'][1];
    p.az =  options[prefix + 'rot'][2];
  }
  if(options[prefix + 'rot_post']) {
    p.bx =  options[prefix + 'rot_post'][0];
    p.by =  options[prefix + 'rot_post'][1];
    p.bz =  options[prefix + 'rot_post'][2];
  }
  if(options[prefix + 'scale']) {
    p.sx =  options[prefix + 'scale'][0];
    p.sy =  options[prefix + 'scale'][1];
  }
  if(options[prefix + 'width'] !== undefined) {
    p.width =  options[prefix + 'width'];
  }
  if(options[prefix + 'height'] !== undefined) {
    p.height =  options[prefix + 'height'];
  }
  if(options[prefix + 'opacity'] !== undefined) {
    p.opacity =  options[prefix + 'opacity'];
  }
  return p;
}


function snabbt(e, options) {
  if(e == 'scroll') {
    return snabbtjs.setup_scroll_animation(options);
  }

  var start = new snabbtjs.State({});
  start = state_from_options(start, options, 'from_');
  var end = new snabbtjs.State({});
  end = state_from_options(end, options, '');

  var anim_options = {
    start_state: start,
    end_state: end,
    duration: options.duration || 1000,
    delay: options.delay || 0,
    offset: options.offset
  };
  if(options.easing)
    anim_options.easing = snabbtjs.EASING_FUNCS[options.easing];
  if(options.manual)
    anim_options.mode = snabbtjs.AnimationType.MANUAL;
  var animation = new snabbtjs.Animation(anim_options);

  var queue = [];
  var chainer = {
    then: function(opts) {
      queue.unshift(opts);
      return chainer;
    }
  };

  function tick(time) {
    animation.tick(time);
    var current_state = animation.current_state();
    snabbtjs.set_css(e, current_state);

    if(animation.completed()) {
      var end_state = animation.end_state();
      snabbtjs.set_css(e, end_state);

      if(options.loop > 1) {
        options.loop -= 1;
        animation.assign(anim_options);
        requestAnimFrame(tick);
      } else {
        if(options.callback) {
          options.callback();
        }
        if(queue.length) {
          options = queue.pop();

          start = state_from_options(end, options, 'from_');
          end = state_from_options(new snabbtjs.State({}), options, '');
          animation.assign({
            start_state: start,
            end_state: end,
            duration: options.duration || 1000,
            delay: options.delay || 0,
            offset: options.offset
          });
          if(options.easing)
            animation.easing = snabbtjs.EASING_FUNCS[options.easing];

          animation.tick(time);
          requestAnimFrame(tick);
        }
      }
    } else {
      requestAnimFrame(tick);
    }
  }

  requestAnimFrame(tick);
  if(options.manual) 
    return animation;
  else
    return chainer;
}

snabbtjs.setup_scroll_animation = function(options) {
  var animation = new snabbtjs.ScrollAnimation(options);

  function tick(time) {
    animation.tick(time);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  }
  requestAnimFrame(tick);
};

;var snabbtjs = snabbtjs || {};

snabbtjs.assigned_matrix_multiplication = function(a, b, res) {
  // Unrolled loop
  res[0] = a[0] * b[0] +
           a[1] * b[4] +
           a[2] * b[8] +
           a[3] * b[12];
  res[1] = a[0] * b[1] +
           a[1] * b[5] +
           a[2] * b[9] +
           a[3] * b[13];
  res[2] = a[0] * b[2] +
           a[1] * b[6] +
           a[2] * b[10] +
           a[3] * b[14];
  res[3] = a[0] * b[3] +
           a[1] * b[7] +
           a[2] * b[11] +
           a[3] * b[15];

  res[4] = a[4] * b[0] +
           a[5] * b[4] +
           a[6] * b[8] +
           a[7] * b[12];
  res[5] = a[4] * b[1] +
           a[5] * b[5] +
           a[6] * b[9] +
           a[7] * b[13];
  res[6] = a[4] * b[2] +
           a[5] * b[6] +
           a[6] * b[10] +
           a[7] * b[14];
  res[7] = a[4] * b[3] +
           a[5] * b[7] +
           a[6] * b[11] +
           a[7] * b[15];

  res[8] = a[8] * b[0] +
           a[9] * b[4] +
           a[10] * b[8] +
           a[11] * b[12];
  res[9] = a[8] * b[1] +
           a[9] * b[5] +
           a[10] * b[9] +
           a[11] * b[13];
  res[10] = a[8] * b[2] +
            a[9] * b[6] +
            a[10] * b[10] +
            a[11] * b[14];
  res[11] = a[8] * b[3] +
            a[9] * b[7] +
            a[10] * b[11] +
            a[11] * b[15];

  res[12] = a[12] * b[0] +
            a[13] * b[4] +
            a[14] * b[8] +
            a[15] * b[12];
  res[13] = a[12] * b[1] +
            a[13] * b[5] +
            a[14] * b[9] +
            a[15] * b[13];
  res[14] = a[12] * b[2] +
            a[13] * b[6] +
            a[14] * b[10] +
            a[15] * b[14];
  res[15] = a[12] * b[3] +
            a[13] * b[7] +
            a[14] * b[11] +
            a[15] * b[15];

  return res;
};

snabbtjs.mat_to_css = function(matrix) {
  var s = 'matrix3d(';
  for(var i=0;i<matrix.length-1;++i) {
    //if(Math.abs(matrix[i]) < 0.000001)
    //  s += "0,";
    //else 
      s += matrix[i].toFixed(10) + ",";
  }
  //if(Math.abs(matrix[15]) < 0.000001)
  //  s += "0)";
  //else 
    s += matrix[15].toFixed(10) + ")";
  return s;
};

snabbtjs.mat_to_css2 = function(matrix) {
  var css = 'matrix3d(' +
            matrix[0].toFixed(10) + ', ' +
            matrix[1].toFixed(10) + ', ' +
            matrix[2].toFixed(10) + ', ' +
            matrix[3].toFixed(10) + ', ' +
            matrix[4].toFixed(10) + ', ' +
            matrix[5].toFixed(10) + ', ' +
            matrix[6].toFixed(10) + ', ' +
            matrix[7].toFixed(10) + ', ' +
            matrix[8].toFixed(10) + ', ' +
            matrix[9].toFixed(10) + ', ' +
            matrix[10].toFixed(10) + ', ' +
            matrix[11].toFixed(10) + ', ' +
            matrix[12].toFixed(10) + ', ' +
            matrix[13].toFixed(10) + ', ' +
            matrix[14].toFixed(10) + ', ' +
            matrix[15].toFixed(10) + ')';
  return css;
};

snabbtjs.mult = function(a, b) {
  var m = new Float32Array(16);
  snabbtjs.assigned_matrix_multiplication(a, b, m);
  return m;
};

snabbtjs.rotX = function(rad) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.assign_rotX = function(m, rad) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotY = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotY = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotZ = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotZ = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.trans = function(x, y, z) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.assign_trans = function(m, x, y, z) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.scale = function(x, y) {
  return new Float32Array([
     x, 0, 0, 0,
     0, y, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_scale = function(m, x, y) {
  m[0] = x; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = y; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.ident = function() {
  return new Float32Array([
     1, 0, 0, 0,
     0, 1, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_ident = function(m) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.set_css = function(el, state) {
  var matrix = state.as_matrix();
  if(el.hasOwnProperty('length')) {
    for(var i=0;i<el.length;++i) {
      el[i].style.webkitTransform = snabbtjs.mat_to_css(matrix);
      //el[i].style.transform = snabbtjs.mat_to_css(matrix);
      if(state.width !== undefined)
        el[i].style.width = state.width + 'px';
      if(state.height !== undefined)
        el[i].style.height = state.height + 'px';
      if(state.opacity !== undefined)
        el[i].style.opacity = state.opacity;
    }
  } else {
    el.style.webkitTransform = snabbtjs.mat_to_css(matrix);
    //el.style.transform = snabbtjs.mat_to_css(matrix);
    if(state.width !== undefined)
      el.style.width = state.width + 'px';
    if(state.height !== undefined)
      el.style.height = state.height + 'px';
    if(state.opacity !== undefined)
      el.style.opacity = state.opacity;
  }
};

;snabbtjs.State = function(config) {
  this.ax = config.ax || 0;
  this.ay = config.ay || 0;
  this.az = config.az || 0;
  this.x = config.x || 0;
  this.y = config.y || 0;
  this.z = config.z || 0;
  this.bx = config.bx || 0;
  this.by = config.by || 0;
  this.bz = config.bz || 0;
  this.offset_x = config.offset_x || 0;
  this.offset_y = config.offset_y || 0;
  this.offset_z = config.offset_z || 0;
  this.sx = config.sx || 1;
  this.sy = config.sy || 1;
  this.width = config.width;
  this.height = config.height;
  this.opacity = config.opacity;
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
    sx: this.sx,
    sy: this.sy,
    height: this.height,
    width: this.width,
    opacity: this.opacity
  });
  return p;
};

snabbtjs.State.prototype.assign = function(p) {
  this.ax = p.ax;
  this.ay = p.ay;
  this.az = p.az;
  this.x = p.x;
  this.y = p.y;
  this.z = p.z;
  this.bx = p.bx;
  this.by = p.by;
  this.bz = p.bz;
  this.sx = p.sx;
  this.sy = p.sy;
  this.opacity = p.opacity;
};

//  Reuse the same three matrices everytime.
var temp_m = snabbtjs.ident();
var temp_res1 = snabbtjs.ident();
var temp_res2 = snabbtjs.ident();

snabbtjs.State.prototype.as_matrix = function() {
  // Scale
  snabbtjs.assign_scale(temp_res1, this.sx, this.sy);

  // Pre-rotation
  snabbtjs.assign_rotX(temp_res2, this.ax);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_res2, temp_m);

  snabbtjs.assign_rotY(temp_res1, this.ay);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_m, temp_res2);
  snabbtjs.assign_rotZ(temp_m, this.az);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res2, temp_res1);

  // Translation
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_trans(temp_m, this.x, this.y, this.z), temp_res2);

  // Post-rotation
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotX(temp_m, this.bx), temp_res1);
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_rotY(temp_m, this.by), temp_res2);
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotZ(temp_m, this.bz), temp_res1);

  // Final offset
  snabbtjs.assign_trans(temp_m, this.offset_x, this.offset_y, this.offset_z);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res1, temp_res2);
  return temp_res2;
};

;var tick_requests = [];

function requestAnimFrame(func) {
  tick_requests.push(func);
}

function master_tick(time) {
  var length = tick_requests.length;
  for(var i=0;i<length;++i) {
    tick_requests[i](time);
  }
  tick_requests.splice(0, length);
  window.requestAnimationFrame(master_tick);
}

window.requestAnimationFrame(master_tick);

function state_from_options(p, options, prefix) {

  if(options[prefix + 'pos']) {
    p.x = options[prefix + 'pos'][0];
    p.y = options[prefix + 'pos'][1];
    p.z = options[prefix + 'pos'][2];
  }
  if(options[prefix + 'rot']) {
    p.ax =  options[prefix + 'rot'][0];
    p.ay =  options[prefix + 'rot'][1];
    p.az =  options[prefix + 'rot'][2];
  }
  if(options[prefix + 'rot_post']) {
    p.bx =  options[prefix + 'rot_post'][0];
    p.by =  options[prefix + 'rot_post'][1];
    p.bz =  options[prefix + 'rot_post'][2];
  }
  if(options[prefix + 'scale']) {
    p.sx =  options[prefix + 'scale'][0];
    p.sy =  options[prefix + 'scale'][1];
  }
  if(options[prefix + 'width'] !== undefined) {
    p.width =  options[prefix + 'width'];
  }
  if(options[prefix + 'height'] !== undefined) {
    p.height =  options[prefix + 'height'];
  }
  if(options[prefix + 'opacity'] !== undefined) {
    p.opacity =  options[prefix + 'opacity'];
  }
  return p;
}


function snabbt(e, options) {
  if(e == 'scroll') {
    return snabbtjs.setup_scroll_animation(options);
  }

  var start = new snabbtjs.State({});
  start = state_from_options(start, options, 'from_');
  var end = new snabbtjs.State({});
  end = state_from_options(end, options, '');

  var anim_options = {
    start_state: start,
    end_state: end,
    duration: options.duration || 1000,
    delay: options.delay || 0,
    offset: options.offset
  };
  if(options.easing)
    anim_options.easing = snabbtjs.EASING_FUNCS[options.easing];
  if(options.manual)
    anim_options.mode = snabbtjs.AnimationType.MANUAL;
  var animation = new snabbtjs.Animation(anim_options);

  var queue = [];
  var chainer = {
    then: function(opts) {
      queue.unshift(opts);
      return chainer;
    }
  };

  function tick(time) {
    animation.tick(time);
    var current_state = animation.current_state();
    snabbtjs.set_css(e, current_state);

    if(animation.completed()) {
      var end_state = animation.end_state();
      snabbtjs.set_css(e, end_state);

      if(options.loop > 1) {
        options.loop -= 1;
        animation.assign(anim_options);
        requestAnimFrame(tick);
      } else {
        if(options.callback) {
          options.callback();
        }
        if(queue.length) {
          options = queue.pop();

          start = state_from_options(end, options, 'from_');
          end = state_from_options(new snabbtjs.State({}), options, '');
          animation.assign({
            start_state: start,
            end_state: end,
            duration: options.duration || 1000,
            delay: options.delay || 0,
            offset: options.offset
          });
          if(options.easing)
            animation.easing = snabbtjs.EASING_FUNCS[options.easing];

          animation.tick(time);
          requestAnimFrame(tick);
        }
      }
    } else {
      requestAnimFrame(tick);
    }
  }

  requestAnimFrame(tick);
  if(options.manual) 
    return animation;
  else
    return chainer;
}

snabbtjs.setup_scroll_animation = function(options) {
  var animation = new snabbtjs.ScrollAnimation(options);

  function tick(time) {
    animation.tick(time);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  }
  requestAnimFrame(tick);
};

;var snabbtjs = snabbtjs || {};

snabbtjs.assigned_matrix_multiplication = function(a, b, res) {
  // Unrolled loop
  res[0] = a[0] * b[0] +
           a[1] * b[4] +
           a[2] * b[8] +
           a[3] * b[12];
  res[1] = a[0] * b[1] +
           a[1] * b[5] +
           a[2] * b[9] +
           a[3] * b[13];
  res[2] = a[0] * b[2] +
           a[1] * b[6] +
           a[2] * b[10] +
           a[3] * b[14];
  res[3] = a[0] * b[3] +
           a[1] * b[7] +
           a[2] * b[11] +
           a[3] * b[15];

  res[4] = a[4] * b[0] +
           a[5] * b[4] +
           a[6] * b[8] +
           a[7] * b[12];
  res[5] = a[4] * b[1] +
           a[5] * b[5] +
           a[6] * b[9] +
           a[7] * b[13];
  res[6] = a[4] * b[2] +
           a[5] * b[6] +
           a[6] * b[10] +
           a[7] * b[14];
  res[7] = a[4] * b[3] +
           a[5] * b[7] +
           a[6] * b[11] +
           a[7] * b[15];

  res[8] = a[8] * b[0] +
           a[9] * b[4] +
           a[10] * b[8] +
           a[11] * b[12];
  res[9] = a[8] * b[1] +
           a[9] * b[5] +
           a[10] * b[9] +
           a[11] * b[13];
  res[10] = a[8] * b[2] +
            a[9] * b[6] +
            a[10] * b[10] +
            a[11] * b[14];
  res[11] = a[8] * b[3] +
            a[9] * b[7] +
            a[10] * b[11] +
            a[11] * b[15];

  res[12] = a[12] * b[0] +
            a[13] * b[4] +
            a[14] * b[8] +
            a[15] * b[12];
  res[13] = a[12] * b[1] +
            a[13] * b[5] +
            a[14] * b[9] +
            a[15] * b[13];
  res[14] = a[12] * b[2] +
            a[13] * b[6] +
            a[14] * b[10] +
            a[15] * b[14];
  res[15] = a[12] * b[3] +
            a[13] * b[7] +
            a[14] * b[11] +
            a[15] * b[15];

  return res;
};

snabbtjs.mat_to_css = function(matrix) {
  var s = 'matrix3d(';
  for(var i=0;i<matrix.length-1;++i) {
    //if(Math.abs(matrix[i]) < 0.000001)
    //  s += "0,";
    //else 
      s += matrix[i].toFixed(10) + ",";
  }
  //if(Math.abs(matrix[15]) < 0.000001)
  //  s += "0)";
  //else 
    s += matrix[15].toFixed(10) + ")";
  return s;
};

snabbtjs.mat_to_css2 = function(matrix) {
  var css = 'matrix3d(' +
            matrix[0].toFixed(10) + ', ' +
            matrix[1].toFixed(10) + ', ' +
            matrix[2].toFixed(10) + ', ' +
            matrix[3].toFixed(10) + ', ' +
            matrix[4].toFixed(10) + ', ' +
            matrix[5].toFixed(10) + ', ' +
            matrix[6].toFixed(10) + ', ' +
            matrix[7].toFixed(10) + ', ' +
            matrix[8].toFixed(10) + ', ' +
            matrix[9].toFixed(10) + ', ' +
            matrix[10].toFixed(10) + ', ' +
            matrix[11].toFixed(10) + ', ' +
            matrix[12].toFixed(10) + ', ' +
            matrix[13].toFixed(10) + ', ' +
            matrix[14].toFixed(10) + ', ' +
            matrix[15].toFixed(10) + ')';
  return css;
};

snabbtjs.mult = function(a, b) {
  var m = new Float32Array(16);
  snabbtjs.assigned_matrix_multiplication(a, b, m);
  return m;
};

snabbtjs.rotX = function(rad) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.assign_rotX = function(m, rad) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotY = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotY = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotZ = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotZ = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.trans = function(x, y, z) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.assign_trans = function(m, x, y, z) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.scale = function(x, y) {
  return new Float32Array([
     x, 0, 0, 0,
     0, y, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_scale = function(m, x, y) {
  m[0] = x; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = y; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.ident = function() {
  return new Float32Array([
     1, 0, 0, 0,
     0, 1, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_ident = function(m) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.set_css = function(el, state) {
  var matrix = state.as_matrix();
  if(el.hasOwnProperty('length')) {
    for(var i=0;i<el.length;++i) {
      el[i].style.webkitTransform = snabbtjs.mat_to_css(matrix);
      el[i].style.transform = snabbtjs.mat_to_css(matrix);
      if(state.width !== undefined)
        el[i].style.width = state.width + 'px';
      if(state.height !== undefined)
        el[i].style.height = state.height + 'px';
      if(state.opacity !== undefined)
        el[i].style.opacity = state.opacity;
    }
  } else {
    el.style.webkitTransform = snabbtjs.mat_to_css(matrix);
    el.style.transform = snabbtjs.mat_to_css(matrix);
    if(state.width !== undefined)
      el.style.width = state.width + 'px';
    if(state.height !== undefined)
      el.style.height = state.height + 'px';
    if(state.opacity !== undefined)
      el.style.opacity = state.opacity;
  }
};

;snabbtjs.State = function(config) {
  this.ax = config.ax || 0;
  this.ay = config.ay || 0;
  this.az = config.az || 0;
  this.x = config.x || 0;
  this.y = config.y || 0;
  this.z = config.z || 0;
  this.bx = config.bx || 0;
  this.by = config.by || 0;
  this.bz = config.bz || 0;
  this.offset_x = config.offset_x || 0;
  this.offset_y = config.offset_y || 0;
  this.offset_z = config.offset_z || 0;
  this.sx = config.sx || 1;
  this.sy = config.sy || 1;
  this.width = config.width;
  this.height = config.height;
  this.opacity = config.opacity;
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
    sx: this.sx,
    sy: this.sy,
    height: this.height,
    width: this.width,
    opacity: this.opacity
  });
  return p;
};

snabbtjs.State.prototype.assign = function(p) {
  this.ax = p.ax;
  this.ay = p.ay;
  this.az = p.az;
  this.x = p.x;
  this.y = p.y;
  this.z = p.z;
  this.bx = p.bx;
  this.by = p.by;
  this.bz = p.bz;
  this.sx = p.sx;
  this.sy = p.sy;
  this.opacity = p.opacity;
};

//  Reuse the same three matrices everytime.
var temp_m = snabbtjs.ident();
var temp_res1 = snabbtjs.ident();
var temp_res2 = snabbtjs.ident();

snabbtjs.State.prototype.as_matrix = function() {
  // Scale
  snabbtjs.assign_scale(temp_res1, this.sx, this.sy);

  // Pre-rotation
  snabbtjs.assign_rotX(temp_res2, this.ax);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_res2, temp_m);

  snabbtjs.assign_rotY(temp_res1, this.ay);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_m, temp_res2);
  snabbtjs.assign_rotZ(temp_m, this.az);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res2, temp_res1);

  // Translation
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_trans(temp_m, this.x, this.y, this.z), temp_res2);

  // Post-rotation
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotX(temp_m, this.bx), temp_res1);
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_rotY(temp_m, this.by), temp_res2);
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotZ(temp_m, this.bz), temp_res1);

  // Final offset
  snabbtjs.assign_trans(temp_m, this.offset_x, this.offset_y, this.offset_z);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res1, temp_res2);
  return temp_res2;
};

;var tick_requests = [];

function requestAnimFrame(func) {
  tick_requests.push(func);
}

function master_tick(time) {
  var length = tick_requests.length;
  for(var i=0;i<length;++i) {
    tick_requests[i](time);
  }
  tick_requests.splice(0, length);
  window.requestAnimationFrame(master_tick);
}

window.requestAnimationFrame(master_tick);

function state_from_options(p, options, prefix) {

  if(options[prefix + 'pos']) {
    p.x = options[prefix + 'pos'][0];
    p.y = options[prefix + 'pos'][1];
    p.z = options[prefix + 'pos'][2];
  }
  if(options[prefix + 'rot']) {
    p.ax =  options[prefix + 'rot'][0];
    p.ay =  options[prefix + 'rot'][1];
    p.az =  options[prefix + 'rot'][2];
  }
  if(options[prefix + 'rot_post']) {
    p.bx =  options[prefix + 'rot_post'][0];
    p.by =  options[prefix + 'rot_post'][1];
    p.bz =  options[prefix + 'rot_post'][2];
  }
  if(options[prefix + 'scale']) {
    p.sx =  options[prefix + 'scale'][0];
    p.sy =  options[prefix + 'scale'][1];
  }
  if(options[prefix + 'width'] !== undefined) {
    p.width =  options[prefix + 'width'];
  }
  if(options[prefix + 'height'] !== undefined) {
    p.height =  options[prefix + 'height'];
  }
  if(options[prefix + 'opacity'] !== undefined) {
    p.opacity =  options[prefix + 'opacity'];
  }
  return p;
}


function snabbt(e, options) {
  if(e == 'scroll') {
    return snabbtjs.setup_scroll_animation(options);
  }

  var start = new snabbtjs.State({});
  start = state_from_options(start, options, 'from_');
  var end = new snabbtjs.State({});
  end = state_from_options(end, options, '');

  var anim_options = {
    start_state: start,
    end_state: end,
    duration: options.duration || 1000,
    delay: options.delay || 0,
    offset: options.offset
  };
  if(options.easing)
    anim_options.easing = snabbtjs.EASING_FUNCS[options.easing];
  if(options.manual)
    anim_options.mode = snabbtjs.AnimationType.MANUAL;
  var animation = new snabbtjs.Animation(anim_options);

  var queue = [];
  var chainer = {
    then: function(opts) {
      queue.unshift(opts);
      return chainer;
    }
  };

  function tick(time) {
    animation.tick(time);
    var current_state = animation.current_state();
    snabbtjs.set_css(e, current_state);

    if(animation.completed()) {
      var end_state = animation.end_state();
      snabbtjs.set_css(e, end_state);

      if(options.loop > 1) {
        options.loop -= 1;
        animation.assign(anim_options);
        requestAnimFrame(tick);
      } else {
        if(options.callback) {
          options.callback();
        }
        if(queue.length) {
          options = queue.pop();

          start = state_from_options(end, options, 'from_');
          end = state_from_options(new snabbtjs.State({}), options, '');
          animation.assign({
            start_state: start,
            end_state: end,
            duration: options.duration || 1000,
            delay: options.delay || 0,
            offset: options.offset
          });
          if(options.easing)
            animation.easing = snabbtjs.EASING_FUNCS[options.easing];

          animation.tick(time);
          requestAnimFrame(tick);
        }
      }
    } else {
      requestAnimFrame(tick);
    }
  }

  requestAnimFrame(tick);
  if(options.manual) 
    return animation;
  else
    return chainer;
}

snabbtjs.setup_scroll_animation = function(options) {
  var animation = new snabbtjs.ScrollAnimation(options);

  function tick(time) {
    animation.tick(time);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  }
  requestAnimFrame(tick);
};

;var snabbtjs = snabbtjs || {};

snabbtjs.assigned_matrix_multiplication = function(a, b, res) {
  // Unrolled loop
  res[0] = a[0] * b[0] +
           a[1] * b[4] +
           a[2] * b[8] +
           a[3] * b[12];
  res[1] = a[0] * b[1] +
           a[1] * b[5] +
           a[2] * b[9] +
           a[3] * b[13];
  res[2] = a[0] * b[2] +
           a[1] * b[6] +
           a[2] * b[10] +
           a[3] * b[14];
  res[3] = a[0] * b[3] +
           a[1] * b[7] +
           a[2] * b[11] +
           a[3] * b[15];

  res[4] = a[4] * b[0] +
           a[5] * b[4] +
           a[6] * b[8] +
           a[7] * b[12];
  res[5] = a[4] * b[1] +
           a[5] * b[5] +
           a[6] * b[9] +
           a[7] * b[13];
  res[6] = a[4] * b[2] +
           a[5] * b[6] +
           a[6] * b[10] +
           a[7] * b[14];
  res[7] = a[4] * b[3] +
           a[5] * b[7] +
           a[6] * b[11] +
           a[7] * b[15];

  res[8] = a[8] * b[0] +
           a[9] * b[4] +
           a[10] * b[8] +
           a[11] * b[12];
  res[9] = a[8] * b[1] +
           a[9] * b[5] +
           a[10] * b[9] +
           a[11] * b[13];
  res[10] = a[8] * b[2] +
            a[9] * b[6] +
            a[10] * b[10] +
            a[11] * b[14];
  res[11] = a[8] * b[3] +
            a[9] * b[7] +
            a[10] * b[11] +
            a[11] * b[15];

  res[12] = a[12] * b[0] +
            a[13] * b[4] +
            a[14] * b[8] +
            a[15] * b[12];
  res[13] = a[12] * b[1] +
            a[13] * b[5] +
            a[14] * b[9] +
            a[15] * b[13];
  res[14] = a[12] * b[2] +
            a[13] * b[6] +
            a[14] * b[10] +
            a[15] * b[14];
  res[15] = a[12] * b[3] +
            a[13] * b[7] +
            a[14] * b[11] +
            a[15] * b[15];

  return res;
};

//snabbtjs.mat_to_css = function(matrix) {
//  var s = 'matrix3d(';
//  for(var i=0;i<matrix.length-1;++i) {
//    //if(Math.abs(matrix[i]) < 0.000001)
//    //  s += "0,";
//    //else 
//      s += matrix[i].toFixed(10) + ",";
//  }
//  //if(Math.abs(matrix[15]) < 0.000001)
//  //  s += "0)";
//  //else 
//    s += matrix[15].toFixed(10) + ")";
//  return s;
//};

snabbtjs.mat_to_css = function(matrix) {
  var css = 'matrix3d(' +
            matrix[0].toFixed(10) + ', ' +
            matrix[1].toFixed(10) + ', ' +
            matrix[2].toFixed(10) + ', ' +
            matrix[3].toFixed(10) + ', ' +
            matrix[4].toFixed(10) + ', ' +
            matrix[5].toFixed(10) + ', ' +
            matrix[6].toFixed(10) + ', ' +
            matrix[7].toFixed(10) + ', ' +
            matrix[8].toFixed(10) + ', ' +
            matrix[9].toFixed(10) + ', ' +
            matrix[10].toFixed(10) + ', ' +
            matrix[11].toFixed(10) + ', ' +
            matrix[12].toFixed(10) + ', ' +
            matrix[13].toFixed(10) + ', ' +
            matrix[14].toFixed(10) + ', ' +
            matrix[15].toFixed(10) + ')';
  return css;
};

snabbtjs.mult = function(a, b) {
  var m = new Float32Array(16);
  snabbtjs.assigned_matrix_multiplication(a, b, m);
  return m;
};

snabbtjs.rotX = function(rad) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.assign_rotX = function(m, rad) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotY = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotY = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotZ = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotZ = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.trans = function(x, y, z) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.assign_trans = function(m, x, y, z) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.scale = function(x, y) {
  return new Float32Array([
     x, 0, 0, 0,
     0, y, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_scale = function(m, x, y) {
  m[0] = x; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = y; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.ident = function() {
  return new Float32Array([
     1, 0, 0, 0,
     0, 1, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_ident = function(m) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.set_css = function(el, state) {
  var matrix = state.as_matrix();
  if(el.hasOwnProperty('length')) {
    for(var i=0;i<el.length;++i) {
      el[i].style.webkitTransform = snabbtjs.mat_to_css(matrix);
      el[i].style.transform = snabbtjs.mat_to_css(matrix);
      if(state.width !== undefined)
        el[i].style.width = state.width + 'px';
      if(state.height !== undefined)
        el[i].style.height = state.height + 'px';
      if(state.opacity !== undefined)
        el[i].style.opacity = state.opacity;
    }
  } else {
    el.style.webkitTransform = snabbtjs.mat_to_css(matrix);
    el.style.transform = snabbtjs.mat_to_css(matrix);
    if(state.width !== undefined)
      el.style.width = state.width + 'px';
    if(state.height !== undefined)
      el.style.height = state.height + 'px';
    if(state.opacity !== undefined)
      el.style.opacity = state.opacity;
  }
};

;snabbtjs.State = function(config) {
  this.ax = config.ax || 0;
  this.ay = config.ay || 0;
  this.az = config.az || 0;
  this.x = config.x || 0;
  this.y = config.y || 0;
  this.z = config.z || 0;
  this.bx = config.bx || 0;
  this.by = config.by || 0;
  this.bz = config.bz || 0;
  this.offset_x = config.offset_x || 0;
  this.offset_y = config.offset_y || 0;
  this.offset_z = config.offset_z || 0;
  this.sx = config.sx || 1;
  this.sy = config.sy || 1;
  this.width = config.width;
  this.height = config.height;
  this.opacity = config.opacity;
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
    sx: this.sx,
    sy: this.sy,
    height: this.height,
    width: this.width,
    opacity: this.opacity
  });
  return p;
};

snabbtjs.State.prototype.assign = function(p) {
  this.ax = p.ax;
  this.ay = p.ay;
  this.az = p.az;
  this.x = p.x;
  this.y = p.y;
  this.z = p.z;
  this.bx = p.bx;
  this.by = p.by;
  this.bz = p.bz;
  this.sx = p.sx;
  this.sy = p.sy;
  this.opacity = p.opacity;
};

//  Reuse the same three matrices everytime.
var temp_m = snabbtjs.ident();
var temp_res1 = snabbtjs.ident();
var temp_res2 = snabbtjs.ident();

snabbtjs.State.prototype.as_matrix = function() {
  // Scale
  snabbtjs.assign_scale(temp_res1, this.sx, this.sy);

  // Pre-rotation
  snabbtjs.assign_rotX(temp_res2, this.ax);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_res2, temp_m);

  snabbtjs.assign_rotY(temp_res1, this.ay);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_m, temp_res2);
  snabbtjs.assign_rotZ(temp_m, this.az);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res2, temp_res1);

  // Translation
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_trans(temp_m, this.x, this.y, this.z), temp_res2);

  // Post-rotation
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotX(temp_m, this.bx), temp_res1);
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_rotY(temp_m, this.by), temp_res2);
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotZ(temp_m, this.bz), temp_res1);

  // Final offset
  snabbtjs.assign_trans(temp_m, this.offset_x, this.offset_y, this.offset_z);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res1, temp_res2);
  return temp_res2;
};

;
queue_length = 100;
tick_requests = Array(queue_length);
tick_start = 0;
tick_end = 0;


function requestAnimFrame(func) {
  tick_requests[tick_end] = func;
  tick_end = (tick_end + 1) % queue_length;
}

function master_tick(time) {
  for(var i=tick_start;i<tick_end + queue_length; ++i) {
    var real_i = i % tick_requests.length;
    tick_requests[real_i](time);
  }
  tick_start = tick_end;
  window.requestAnimationFrame(master_tick);
  //var length = tick_requests.length;
  //for(var i=0;i<length;++i) {
  //  tick_requests[i](time);
  //}
  //tick_requests.splice(0, length);
}

window.requestAnimationFrame(master_tick);

function state_from_options(p, options, prefix) {

  if(options[prefix + 'pos']) {
    p.x = options[prefix + 'pos'][0];
    p.y = options[prefix + 'pos'][1];
    p.z = options[prefix + 'pos'][2];
  }
  if(options[prefix + 'rot']) {
    p.ax =  options[prefix + 'rot'][0];
    p.ay =  options[prefix + 'rot'][1];
    p.az =  options[prefix + 'rot'][2];
  }
  if(options[prefix + 'rot_post']) {
    p.bx =  options[prefix + 'rot_post'][0];
    p.by =  options[prefix + 'rot_post'][1];
    p.bz =  options[prefix + 'rot_post'][2];
  }
  if(options[prefix + 'scale']) {
    p.sx =  options[prefix + 'scale'][0];
    p.sy =  options[prefix + 'scale'][1];
  }
  if(options[prefix + 'width'] !== undefined) {
    p.width =  options[prefix + 'width'];
  }
  if(options[prefix + 'height'] !== undefined) {
    p.height =  options[prefix + 'height'];
  }
  if(options[prefix + 'opacity'] !== undefined) {
    p.opacity =  options[prefix + 'opacity'];
  }
  return p;
}


function snabbt(e, options) {
  if(e == 'scroll')
    return snabbtjs.setup_scroll_animation(options);
  if(e == 'attention')
    return snabbtjs.setup_attention_animation(options);


  var start = new snabbtjs.State({});
  start = state_from_options(start, options, 'from_');
  var end = new snabbtjs.State({});
  end = state_from_options(end, options, '');

  var anim_options = {
    start_state: start,
    end_state: end,
    duration: options.duration || 1000,
    delay: options.delay || 0,
    offset: options.offset
  };
  if(options.easing)
    anim_options.easing = snabbtjs.EASING_FUNCS[options.easing];
  if(options.manual)
    anim_options.mode = snabbtjs.AnimationType.MANUAL;
  var animation = new snabbtjs.Animation(anim_options);

  var queue = [];
  var chainer = {
    then: function(opts) {
      queue.unshift(opts);
      return chainer;
    }
  };

  function tick(time) {
    animation.tick(time);
    var current_state = animation.current_state();
    snabbtjs.set_css(e, current_state);

    if(animation.completed()) {
      var end_state = animation.end_state();
      snabbtjs.set_css(e, end_state);

      if(options.loop > 1) {
        options.loop -= 1;
        animation.assign(anim_options);
        requestAnimFrame(tick);
      } else {
        if(options.callback) {
          options.callback();
        }
        if(queue.length) {
          options = queue.pop();

          start = state_from_options(end, options, 'from_');
          end = state_from_options(new snabbtjs.State({}), options, '');
          animation.assign({
            start_state: start,
            end_state: end,
            duration: options.duration || 1000,
            delay: options.delay || 0,
            offset: options.offset
          });
          if(options.easing)
            animation.easing = snabbtjs.EASING_FUNCS[options.easing];

          animation.tick(time);
          requestAnimFrame(tick);
        }
      }
    } else {
      requestAnimFrame(tick);
    }
  }

  requestAnimFrame(tick);
  if(options.manual) 
    return animation;
  else
    return chainer;
}

snabbtjs.setup_scroll_animation = function(options) {
  var animation = new snabbtjs.ScrollAnimation(options);

  function tick(time) {
    animation.tick(time);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  }
  requestAnimFrame(tick);
};

snabbtjs.setup_attention_animation = function(options) {

  var animation = new snabbtjs.AttentionAnimation(options);

  function tick(time) {
    animation.tick(time);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  };
  requestAnimFrame(tick);
};
;var snabbtjs = snabbtjs || {};

snabbtjs.assigned_matrix_multiplication = function(a, b, res) {
  // Unrolled loop
  res[0] = a[0] * b[0] +
           a[1] * b[4] +
           a[2] * b[8] +
           a[3] * b[12];
  res[1] = a[0] * b[1] +
           a[1] * b[5] +
           a[2] * b[9] +
           a[3] * b[13];
  res[2] = a[0] * b[2] +
           a[1] * b[6] +
           a[2] * b[10] +
           a[3] * b[14];
  res[3] = a[0] * b[3] +
           a[1] * b[7] +
           a[2] * b[11] +
           a[3] * b[15];

  res[4] = a[4] * b[0] +
           a[5] * b[4] +
           a[6] * b[8] +
           a[7] * b[12];
  res[5] = a[4] * b[1] +
           a[5] * b[5] +
           a[6] * b[9] +
           a[7] * b[13];
  res[6] = a[4] * b[2] +
           a[5] * b[6] +
           a[6] * b[10] +
           a[7] * b[14];
  res[7] = a[4] * b[3] +
           a[5] * b[7] +
           a[6] * b[11] +
           a[7] * b[15];

  res[8] = a[8] * b[0] +
           a[9] * b[4] +
           a[10] * b[8] +
           a[11] * b[12];
  res[9] = a[8] * b[1] +
           a[9] * b[5] +
           a[10] * b[9] +
           a[11] * b[13];
  res[10] = a[8] * b[2] +
            a[9] * b[6] +
            a[10] * b[10] +
            a[11] * b[14];
  res[11] = a[8] * b[3] +
            a[9] * b[7] +
            a[10] * b[11] +
            a[11] * b[15];

  res[12] = a[12] * b[0] +
            a[13] * b[4] +
            a[14] * b[8] +
            a[15] * b[12];
  res[13] = a[12] * b[1] +
            a[13] * b[5] +
            a[14] * b[9] +
            a[15] * b[13];
  res[14] = a[12] * b[2] +
            a[13] * b[6] +
            a[14] * b[10] +
            a[15] * b[14];
  res[15] = a[12] * b[3] +
            a[13] * b[7] +
            a[14] * b[11] +
            a[15] * b[15];

  return res;
};

snabbtjs.mat_to_css = function(matrix) {
  var css = 'matrix3d(' +
            matrix[0].toFixed(10) + ', ' +
            matrix[1].toFixed(10) + ', ' +
            matrix[2].toFixed(10) + ', ' +
            matrix[3].toFixed(10) + ', ' +
            matrix[4].toFixed(10) + ', ' +
            matrix[5].toFixed(10) + ', ' +
            matrix[6].toFixed(10) + ', ' +
            matrix[7].toFixed(10) + ', ' +
            matrix[8].toFixed(10) + ', ' +
            matrix[9].toFixed(10) + ', ' +
            matrix[10].toFixed(10) + ', ' +
            matrix[11].toFixed(10) + ', ' +
            matrix[12].toFixed(10) + ', ' +
            matrix[13].toFixed(10) + ', ' +
            matrix[14].toFixed(10) + ', ' +
            matrix[15].toFixed(10) + ')';
  return css;
};

snabbtjs.mult = function(a, b) {
  var m = new Float32Array(16);
  snabbtjs.assigned_matrix_multiplication(a, b, m);
  return m;
};

snabbtjs.rotX = function(rad) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.assign_rotX = function(m, rad) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotY = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotY = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotZ = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotZ = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.trans = function(x, y, z) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.assign_trans = function(m, x, y, z) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.scale = function(x, y) {
  return new Float32Array([
     x, 0, 0, 0,
     0, y, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_scale = function(m, x, y) {
  m[0] = x; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = y; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.ident = function() {
  return new Float32Array([
     1, 0, 0, 0,
     0, 1, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_ident = function(m) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.set_css = function(el, state) {
  var matrix = state.as_matrix();
  if(el.hasOwnProperty('length')) {
    for(var i=0;i<el.length;++i) {
      el[i].style.webkitTransform = snabbtjs.mat_to_css(matrix);
      el[i].style.transform = snabbtjs.mat_to_css(matrix);
      if(state.width !== undefined)
        el[i].style.width = state.width + 'px';
      if(state.height !== undefined)
        el[i].style.height = state.height + 'px';
      if(state.opacity !== undefined)
        el[i].style.opacity = state.opacity;
    }
  } else {
    el.style.webkitTransform = snabbtjs.mat_to_css(matrix);
    el.style.transform = snabbtjs.mat_to_css(matrix);
    if(state.width !== undefined)
      el.style.width = state.width + 'px';
    if(state.height !== undefined)
      el.style.height = state.height + 'px';
    if(state.opacity !== undefined)
      el.style.opacity = state.opacity;
  }
};

;snabbtjs.State = function(config) {
  this.ax = config.ax || 0;
  this.ay = config.ay || 0;
  this.az = config.az || 0;
  this.x = config.x || 0;
  this.y = config.y || 0;
  this.z = config.z || 0;
  this.bx = config.bx || 0;
  this.by = config.by || 0;
  this.bz = config.bz || 0;
  this.offset_x = config.offset_x || 0;
  this.offset_y = config.offset_y || 0;
  this.offset_z = config.offset_z || 0;
  this.sx = config.sx || 1;
  this.sy = config.sy || 1;
  this.width = config.width;
  this.height = config.height;
  this.opacity = config.opacity;
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
    sx: this.sx,
    sy: this.sy,
    height: this.height,
    width: this.width,
    opacity: this.opacity
  });
  return p;
};

snabbtjs.State.prototype.assign = function(p) {
  this.ax = p.ax;
  this.ay = p.ay;
  this.az = p.az;
  this.x = p.x;
  this.y = p.y;
  this.z = p.z;
  this.bx = p.bx;
  this.by = p.by;
  this.bz = p.bz;
  this.sx = p.sx;
  this.sy = p.sy;
  this.opacity = p.opacity;
};

//  Reuse the same three matrices everytime.
var temp_m = snabbtjs.ident();
var temp_res1 = snabbtjs.ident();
var temp_res2 = snabbtjs.ident();

snabbtjs.State.prototype.as_matrix = function() {
  // Scale
  snabbtjs.assign_scale(temp_res1, this.sx, this.sy);

  // Pre-rotation
  snabbtjs.assign_rotX(temp_res2, this.ax);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_res2, temp_m);

  snabbtjs.assign_rotY(temp_res1, this.ay);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_m, temp_res2);
  snabbtjs.assign_rotZ(temp_m, this.az);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res2, temp_res1);

  // Translation
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_trans(temp_m, this.x, this.y, this.z), temp_res2);

  // Post-rotation
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotX(temp_m, this.bx), temp_res1);
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_rotY(temp_m, this.by), temp_res2);
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotZ(temp_m, this.bz), temp_res1);

  // Final offset
  snabbtjs.assign_trans(temp_m, this.offset_x, this.offset_y, this.offset_z);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res1, temp_res2);
  return temp_res2;
};

;
queue_length = 100;
tick_requests = Array(queue_length);
tick_start = 0;
tick_end = 0;


function requestAnimFrame(func) {
  tick_requests[tick_end] = func;
  tick_end = (tick_end + 1) % queue_length;
}

function master_tick(time) {
  if(tick_start != tick_end) {
    var curr_end = tick_end;
    for(var i=tick_start;i<curr_end + queue_length; ++i) {
      var real_i = i % tick_requests.length;
      tick_requests[real_i](time);
    }
    tick_start = curr_end;
  }
  window.requestAnimationFrame(master_tick);
  //var length = tick_requests.length;
  //for(var i=0;i<length;++i) {
  //  tick_requests[i](time);
  //}
  //tick_requests.splice(0, length);
}

window.requestAnimationFrame(master_tick);

function state_from_options(p, options, prefix) {

  if(options[prefix + 'pos']) {
    p.x = options[prefix + 'pos'][0];
    p.y = options[prefix + 'pos'][1];
    p.z = options[prefix + 'pos'][2];
  }
  if(options[prefix + 'rot']) {
    p.ax =  options[prefix + 'rot'][0];
    p.ay =  options[prefix + 'rot'][1];
    p.az =  options[prefix + 'rot'][2];
  }
  if(options[prefix + 'rot_post']) {
    p.bx =  options[prefix + 'rot_post'][0];
    p.by =  options[prefix + 'rot_post'][1];
    p.bz =  options[prefix + 'rot_post'][2];
  }
  if(options[prefix + 'scale']) {
    p.sx =  options[prefix + 'scale'][0];
    p.sy =  options[prefix + 'scale'][1];
  }
  if(options[prefix + 'width'] !== undefined) {
    p.width =  options[prefix + 'width'];
  }
  if(options[prefix + 'height'] !== undefined) {
    p.height =  options[prefix + 'height'];
  }
  if(options[prefix + 'opacity'] !== undefined) {
    p.opacity =  options[prefix + 'opacity'];
  }
  return p;
}


function snabbt(e, options) {
  if(e == 'scroll')
    return snabbtjs.setup_scroll_animation(options);
  if(e == 'attention')
    return snabbtjs.setup_attention_animation(options);


  var start = new snabbtjs.State({});
  start = state_from_options(start, options, 'from_');
  var end = new snabbtjs.State({});
  end = state_from_options(end, options, '');

  var anim_options = {
    start_state: start,
    end_state: end,
    duration: options.duration || 1000,
    delay: options.delay || 0,
    offset: options.offset
  };
  if(options.easing)
    anim_options.easing = snabbtjs.EASING_FUNCS[options.easing];
  if(options.manual)
    anim_options.mode = snabbtjs.AnimationType.MANUAL;
  var animation = new snabbtjs.Animation(anim_options);

  var queue = [];
  var chainer = {
    then: function(opts) {
      queue.unshift(opts);
      return chainer;
    }
  };

  function tick(time) {
    animation.tick(time);
    var current_state = animation.current_state();
    snabbtjs.set_css(e, current_state);

    if(animation.completed()) {
      var end_state = animation.end_state();
      snabbtjs.set_css(e, end_state);

      if(options.loop > 1) {
        options.loop -= 1;
        animation.assign(anim_options);
        requestAnimFrame(tick);
      } else {
        if(options.callback) {
          options.callback();
        }
        if(queue.length) {
          options = queue.pop();

          start = state_from_options(end, options, 'from_');
          end = state_from_options(new snabbtjs.State({}), options, '');
          animation.assign({
            start_state: start,
            end_state: end,
            duration: options.duration || 1000,
            delay: options.delay || 0,
            offset: options.offset
          });
          if(options.easing)
            animation.easing = snabbtjs.EASING_FUNCS[options.easing];

          animation.tick(time);
          requestAnimFrame(tick);
        }
      }
    } else {
      requestAnimFrame(tick);
    }
  }

  requestAnimFrame(tick);
  if(options.manual) 
    return animation;
  else
    return chainer;
}

snabbtjs.setup_scroll_animation = function(options) {
  var animation = new snabbtjs.ScrollAnimation(options);

  function tick(time) {
    animation.tick(time);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  }
  requestAnimFrame(tick);
};

snabbtjs.setup_attention_animation = function(options) {

  var animation = new snabbtjs.AttentionAnimation(options);

  function tick(time) {
    animation.tick(time);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  };
  requestAnimFrame(tick);
};
;var snabbtjs = snabbtjs || {};

snabbtjs.assigned_matrix_multiplication = function(a, b, res) {
  // Unrolled loop
  res[0] = a[0] * b[0] +
           a[1] * b[4] +
           a[2] * b[8] +
           a[3] * b[12];
  res[1] = a[0] * b[1] +
           a[1] * b[5] +
           a[2] * b[9] +
           a[3] * b[13];
  res[2] = a[0] * b[2] +
           a[1] * b[6] +
           a[2] * b[10] +
           a[3] * b[14];
  res[3] = a[0] * b[3] +
           a[1] * b[7] +
           a[2] * b[11] +
           a[3] * b[15];

  res[4] = a[4] * b[0] +
           a[5] * b[4] +
           a[6] * b[8] +
           a[7] * b[12];
  res[5] = a[4] * b[1] +
           a[5] * b[5] +
           a[6] * b[9] +
           a[7] * b[13];
  res[6] = a[4] * b[2] +
           a[5] * b[6] +
           a[6] * b[10] +
           a[7] * b[14];
  res[7] = a[4] * b[3] +
           a[5] * b[7] +
           a[6] * b[11] +
           a[7] * b[15];

  res[8] = a[8] * b[0] +
           a[9] * b[4] +
           a[10] * b[8] +
           a[11] * b[12];
  res[9] = a[8] * b[1] +
           a[9] * b[5] +
           a[10] * b[9] +
           a[11] * b[13];
  res[10] = a[8] * b[2] +
            a[9] * b[6] +
            a[10] * b[10] +
            a[11] * b[14];
  res[11] = a[8] * b[3] +
            a[9] * b[7] +
            a[10] * b[11] +
            a[11] * b[15];

  res[12] = a[12] * b[0] +
            a[13] * b[4] +
            a[14] * b[8] +
            a[15] * b[12];
  res[13] = a[12] * b[1] +
            a[13] * b[5] +
            a[14] * b[9] +
            a[15] * b[13];
  res[14] = a[12] * b[2] +
            a[13] * b[6] +
            a[14] * b[10] +
            a[15] * b[14];
  res[15] = a[12] * b[3] +
            a[13] * b[7] +
            a[14] * b[11] +
            a[15] * b[15];

  return res;
};

snabbtjs.mat_to_css = function(matrix) {
  var css = 'matrix3d(' +
            matrix[0].toFixed(10) + ', ' +
            matrix[1].toFixed(10) + ', ' +
            matrix[2].toFixed(10) + ', ' +
            matrix[3].toFixed(10) + ', ' +
            matrix[4].toFixed(10) + ', ' +
            matrix[5].toFixed(10) + ', ' +
            matrix[6].toFixed(10) + ', ' +
            matrix[7].toFixed(10) + ', ' +
            matrix[8].toFixed(10) + ', ' +
            matrix[9].toFixed(10) + ', ' +
            matrix[10].toFixed(10) + ', ' +
            matrix[11].toFixed(10) + ', ' +
            matrix[12].toFixed(10) + ', ' +
            matrix[13].toFixed(10) + ', ' +
            matrix[14].toFixed(10) + ', ' +
            matrix[15].toFixed(10) + ')';
  return css;
};

snabbtjs.mult = function(a, b) {
  var m = new Float32Array(16);
  snabbtjs.assigned_matrix_multiplication(a, b, m);
  return m;
};

snabbtjs.rotX = function(rad) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.assign_rotX = function(m, rad) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotY = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotY = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotZ = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotZ = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.trans = function(x, y, z) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.assign_trans = function(m, x, y, z) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.scale = function(x, y) {
  return new Float32Array([
     x, 0, 0, 0,
     0, y, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_scale = function(m, x, y) {
  m[0] = x; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = y; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.ident = function() {
  return new Float32Array([
     1, 0, 0, 0,
     0, 1, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_ident = function(m) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.set_css = function(el, state) {
  var matrix = state.as_matrix();
  if(el.hasOwnProperty('length')) {
    for(var i=0;i<el.length;++i) {
      el[i].style.webkitTransform = snabbtjs.mat_to_css(matrix);
      el[i].style.transform = snabbtjs.mat_to_css(matrix);
      if(state.width !== undefined)
        el[i].style.width = state.width + 'px';
      if(state.height !== undefined)
        el[i].style.height = state.height + 'px';
      if(state.opacity !== undefined)
        el[i].style.opacity = state.opacity;
    }
  } else {
    el.style.webkitTransform = snabbtjs.mat_to_css(matrix);
    el.style.transform = snabbtjs.mat_to_css(matrix);
    if(state.width !== undefined)
      el.style.width = state.width + 'px';
    if(state.height !== undefined)
      el.style.height = state.height + 'px';
    if(state.opacity !== undefined)
      el.style.opacity = state.opacity;
  }
};

;snabbtjs.State = function(config) {
  this.ax = config.ax || 0;
  this.ay = config.ay || 0;
  this.az = config.az || 0;
  this.x = config.x || 0;
  this.y = config.y || 0;
  this.z = config.z || 0;
  this.bx = config.bx || 0;
  this.by = config.by || 0;
  this.bz = config.bz || 0;
  this.offset_x = config.offset_x || 0;
  this.offset_y = config.offset_y || 0;
  this.offset_z = config.offset_z || 0;
  this.sx = config.sx || 1;
  this.sy = config.sy || 1;
  this.width = config.width;
  this.height = config.height;
  this.opacity = config.opacity;
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
    sx: this.sx,
    sy: this.sy,
    height: this.height,
    width: this.width,
    opacity: this.opacity
  });
  return p;
};

snabbtjs.State.prototype.assign = function(p) {
  this.ax = p.ax;
  this.ay = p.ay;
  this.az = p.az;
  this.x = p.x;
  this.y = p.y;
  this.z = p.z;
  this.bx = p.bx;
  this.by = p.by;
  this.bz = p.bz;
  this.sx = p.sx;
  this.sy = p.sy;
  this.opacity = p.opacity;
};

//  Reuse the same three matrices everytime.
var temp_m = snabbtjs.ident();
var temp_res1 = snabbtjs.ident();
var temp_res2 = snabbtjs.ident();

snabbtjs.State.prototype.as_matrix = function() {
  // Scale
  snabbtjs.assign_scale(temp_res1, this.sx, this.sy);

  // Pre-rotation
  snabbtjs.assign_rotX(temp_res2, this.ax);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_res2, temp_m);

  snabbtjs.assign_rotY(temp_res1, this.ay);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_m, temp_res2);
  snabbtjs.assign_rotZ(temp_m, this.az);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res2, temp_res1);

  // Translation
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_trans(temp_m, this.x, this.y, this.z), temp_res2);

  // Post-rotation
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotX(temp_m, this.bx), temp_res1);
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_rotY(temp_m, this.by), temp_res2);
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotZ(temp_m, this.bz), temp_res1);

  // Final offset
  snabbtjs.assign_trans(temp_m, this.offset_x, this.offset_y, this.offset_z);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res1, temp_res2);
  return temp_res2;
};

;
queue_length = 100;
tick_requests = Array(queue_length);
tick_start = 0;
tick_end = 0;


function requestAnimFrame(func) {
  tick_requests[tick_end] = func;
  tick_end = (tick_end + 1) % queue_length;
}

function master_tick(time) {
  if(tick_start != tick_end) {
    var curr_end = tick_end;
    for(var i=tick_start;i<curr_end + queue_length; ++i) {
      var real_i = i % tick_requests.length;
      tick_requests[real_i](time);
    }
    tick_start = curr_end;
  }
  window.requestAnimationFrame(master_tick);
  //var length = tick_requests.length;
  //for(var i=0;i<length;++i) {
  //  tick_requests[i](time);
  //}
  //tick_requests.splice(0, length);
}

window.requestAnimationFrame(master_tick);

function state_from_options(p, options, prefix) {

  if(options[prefix + 'pos']) {
    p.x = options[prefix + 'pos'][0];
    p.y = options[prefix + 'pos'][1];
    p.z = options[prefix + 'pos'][2];
  }
  if(options[prefix + 'rot']) {
    p.ax =  options[prefix + 'rot'][0];
    p.ay =  options[prefix + 'rot'][1];
    p.az =  options[prefix + 'rot'][2];
  }
  if(options[prefix + 'rot_post']) {
    p.bx =  options[prefix + 'rot_post'][0];
    p.by =  options[prefix + 'rot_post'][1];
    p.bz =  options[prefix + 'rot_post'][2];
  }
  if(options[prefix + 'scale']) {
    p.sx =  options[prefix + 'scale'][0];
    p.sy =  options[prefix + 'scale'][1];
  }
  if(options[prefix + 'width'] !== undefined) {
    p.width =  options[prefix + 'width'];
  }
  if(options[prefix + 'height'] !== undefined) {
    p.height =  options[prefix + 'height'];
  }
  if(options[prefix + 'opacity'] !== undefined) {
    p.opacity =  options[prefix + 'opacity'];
  }
  return p;
}


function snabbt(e, options) {
  if(e == 'scroll')
    return snabbtjs.setup_scroll_animation(options);
  if(e == 'attention')
    return snabbtjs.setup_attention_animation(options);


  var start = new snabbtjs.State({});
  start = state_from_options(start, options, 'from_');
  var end = new snabbtjs.State({});
  end = state_from_options(end, options, '');

  var anim_options = {
    start_state: start,
    end_state: end,
    duration: options.duration || 1000,
    delay: options.delay || 0,
    offset: options.offset
  };
  if(options.easing)
    anim_options.easing = snabbtjs.EASING_FUNCS[options.easing];
  if(options.manual)
    anim_options.mode = snabbtjs.AnimationType.MANUAL;
  var animation = new snabbtjs.Animation(anim_options);

  var queue = [];
  var chainer = {
    then: function(opts) {
      queue.unshift(opts);
      return chainer;
    }
  };

  function tick(time) {
    animation.tick(time);
    var current_state = animation.current_state();
    snabbtjs.set_css(e, current_state);

    if(animation.completed()) {
      var end_state = animation.end_state();
      snabbtjs.set_css(e, end_state);

      if(options.loop > 1) {
        options.loop -= 1;
        animation.assign(anim_options);
        requestAnimFrame(tick);
      } else {
        if(options.callback) {
          options.callback();
        }
        if(queue.length) {
          options = queue.pop();

          start = state_from_options(end, options, 'from_');
          end = state_from_options(new snabbtjs.State({}), options, '');
          animation.assign({
            start_state: start,
            end_state: end,
            duration: options.duration || 1000,
            delay: options.delay || 0,
            offset: options.offset
          });
          if(options.easing)
            animation.easing = snabbtjs.EASING_FUNCS[options.easing];

          animation.tick(time);
          requestAnimFrame(tick);
        }
      }
    } else {
      requestAnimFrame(tick);
    }
  }

  requestAnimFrame(tick);
  if(options.manual) 
    return animation;
  else
    return chainer;
}

snabbtjs.setup_scroll_animation = function(options) {
  var animation = new snabbtjs.ScrollAnimation(options);

  function tick(time) {
    animation.tick(time);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  }
  requestAnimFrame(tick);
};

snabbtjs.setup_attention_animation = function(options) {

  var animation = new snabbtjs.AttentionAnimation(options);

  function tick(time) {
    animation.tick(time);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  };
  requestAnimFrame(tick);
};
;var snabbtjs = snabbtjs || {};

snabbtjs.assigned_matrix_multiplication = function(a, b, res) {
  // Unrolled loop
  res[0] = a[0] * b[0] +
           a[1] * b[4] +
           a[2] * b[8] +
           a[3] * b[12];
  res[1] = a[0] * b[1] +
           a[1] * b[5] +
           a[2] * b[9] +
           a[3] * b[13];
  res[2] = a[0] * b[2] +
           a[1] * b[6] +
           a[2] * b[10] +
           a[3] * b[14];
  res[3] = a[0] * b[3] +
           a[1] * b[7] +
           a[2] * b[11] +
           a[3] * b[15];

  res[4] = a[4] * b[0] +
           a[5] * b[4] +
           a[6] * b[8] +
           a[7] * b[12];
  res[5] = a[4] * b[1] +
           a[5] * b[5] +
           a[6] * b[9] +
           a[7] * b[13];
  res[6] = a[4] * b[2] +
           a[5] * b[6] +
           a[6] * b[10] +
           a[7] * b[14];
  res[7] = a[4] * b[3] +
           a[5] * b[7] +
           a[6] * b[11] +
           a[7] * b[15];

  res[8] = a[8] * b[0] +
           a[9] * b[4] +
           a[10] * b[8] +
           a[11] * b[12];
  res[9] = a[8] * b[1] +
           a[9] * b[5] +
           a[10] * b[9] +
           a[11] * b[13];
  res[10] = a[8] * b[2] +
            a[9] * b[6] +
            a[10] * b[10] +
            a[11] * b[14];
  res[11] = a[8] * b[3] +
            a[9] * b[7] +
            a[10] * b[11] +
            a[11] * b[15];

  res[12] = a[12] * b[0] +
            a[13] * b[4] +
            a[14] * b[8] +
            a[15] * b[12];
  res[13] = a[12] * b[1] +
            a[13] * b[5] +
            a[14] * b[9] +
            a[15] * b[13];
  res[14] = a[12] * b[2] +
            a[13] * b[6] +
            a[14] * b[10] +
            a[15] * b[14];
  res[15] = a[12] * b[3] +
            a[13] * b[7] +
            a[14] * b[11] +
            a[15] * b[15];

  return res;
};

snabbtjs.mat_to_css = function(matrix) {
  var css = 'matrix3d(';
  var MIN = 0.00000001;
  for(var i=0;i<matrix.length-1;++i) {
    if(matrix[i] < MIN)
      css += '0,';
    else
      css += matrix[i].toFixed(10) + ",";
  }
  if(matrix[15] < MIN)
    css += '0';
  else
    css += matrix[15].toFixed(10);
  return css + ")";
};

//snabbtjs.mat_to_css = function(matrix) {
//  var css = 'matrix3d(' +
//            matrix[0].toFixed(10) + ', ' +
//            matrix[1].toFixed(10) + ', ' +
//            matrix[2].toFixed(10) + ', ' +
//            matrix[3].toFixed(10) + ', ' +
//            matrix[4].toFixed(10) + ', ' +
//            matrix[5].toFixed(10) + ', ' +
//            matrix[6].toFixed(10) + ', ' +
//            matrix[7].toFixed(10) + ', ' +
//            matrix[8].toFixed(10) + ', ' +
//            matrix[9].toFixed(10) + ', ' +
//            matrix[10].toFixed(10) + ', ' +
//            matrix[11].toFixed(10) + ', ' +
//            matrix[12].toFixed(10) + ', ' +
//            matrix[13].toFixed(10) + ', ' +
//            matrix[14].toFixed(10) + ', ' +
//            matrix[15].toFixed(10) + ')';
//  return css;
//};

snabbtjs.mult = function(a, b) {
  var m = new Float32Array(16);
  snabbtjs.assigned_matrix_multiplication(a, b, m);
  return m;
};

snabbtjs.rotX = function(rad) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.assign_rotX = function(m, rad) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotY = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotY = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotZ = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotZ = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.trans = function(x, y, z) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.assign_trans = function(m, x, y, z) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.scale = function(x, y) {
  return new Float32Array([
     x, 0, 0, 0,
     0, y, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_scale = function(m, x, y) {
  m[0] = x; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = y; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.ident = function() {
  return new Float32Array([
     1, 0, 0, 0,
     0, 1, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_ident = function(m) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.set_css = function(el, state) {
  var matrix = state.as_matrix();
  if(el.hasOwnProperty('length')) {
    for(var i=0;i<el.length;++i) {
      el[i].style.webkitTransform = snabbtjs.mat_to_css(matrix);
      el[i].style.transform = snabbtjs.mat_to_css(matrix);
      if(state.width !== undefined)
        el[i].style.width = state.width + 'px';
      if(state.height !== undefined)
        el[i].style.height = state.height + 'px';
      if(state.opacity !== undefined)
        el[i].style.opacity = state.opacity;
    }
  } else {
    el.style.webkitTransform = snabbtjs.mat_to_css(matrix);
    el.style.transform = snabbtjs.mat_to_css(matrix);
    if(state.width !== undefined)
      el.style.width = state.width + 'px';
    if(state.height !== undefined)
      el.style.height = state.height + 'px';
    if(state.opacity !== undefined)
      el.style.opacity = state.opacity;
  }
};

;snabbtjs.State = function(config) {
  this.ax = config.ax || 0;
  this.ay = config.ay || 0;
  this.az = config.az || 0;
  this.x = config.x || 0;
  this.y = config.y || 0;
  this.z = config.z || 0;
  this.bx = config.bx || 0;
  this.by = config.by || 0;
  this.bz = config.bz || 0;
  this.offset_x = config.offset_x || 0;
  this.offset_y = config.offset_y || 0;
  this.offset_z = config.offset_z || 0;
  this.sx = config.sx || 1;
  this.sy = config.sy || 1;
  this.width = config.width;
  this.height = config.height;
  this.opacity = config.opacity;
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
    sx: this.sx,
    sy: this.sy,
    height: this.height,
    width: this.width,
    opacity: this.opacity
  });
  return p;
};

snabbtjs.State.prototype.assign = function(p) {
  this.ax = p.ax;
  this.ay = p.ay;
  this.az = p.az;
  this.x = p.x;
  this.y = p.y;
  this.z = p.z;
  this.bx = p.bx;
  this.by = p.by;
  this.bz = p.bz;
  this.sx = p.sx;
  this.sy = p.sy;
  this.opacity = p.opacity;
};

//  Reuse the same three matrices everytime.
var temp_m = snabbtjs.ident();
var temp_res1 = snabbtjs.ident();
var temp_res2 = snabbtjs.ident();

snabbtjs.State.prototype.as_matrix = function() {
  // Scale
  snabbtjs.assign_scale(temp_res1, this.sx, this.sy);

  // Pre-rotation
  snabbtjs.assign_rotX(temp_res2, this.ax);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_res2, temp_m);

  snabbtjs.assign_rotY(temp_res1, this.ay);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_m, temp_res2);
  snabbtjs.assign_rotZ(temp_m, this.az);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res2, temp_res1);

  // Translation
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_trans(temp_m, this.x, this.y, this.z), temp_res2);

  // Post-rotation
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotX(temp_m, this.bx), temp_res1);
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_rotY(temp_m, this.by), temp_res2);
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotZ(temp_m, this.bz), temp_res1);

  // Final offset
  snabbtjs.assign_trans(temp_m, this.offset_x, this.offset_y, this.offset_z);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res1, temp_res2);
  return temp_res2;
};

;
queue_length = 100;
tick_requests = Array(queue_length);
tick_start = 0;
tick_end = 0;


function requestAnimFrame(func) {
  tick_requests[tick_end] = func;
  tick_end = (tick_end + 1) % queue_length;
}

function master_tick(time) {
  if(tick_start != tick_end) {
    var curr_end = tick_end;
    for(var i=tick_start;i<curr_end + queue_length; ++i) {
      var real_i = i % tick_requests.length;
      tick_requests[real_i](time);
    }
    tick_start = curr_end;
  }
  window.requestAnimationFrame(master_tick);
  //var length = tick_requests.length;
  //for(var i=0;i<length;++i) {
  //  tick_requests[i](time);
  //}
  //tick_requests.splice(0, length);
}

window.requestAnimationFrame(master_tick);

function state_from_options(p, options, prefix) {

  if(options[prefix + 'pos']) {
    p.x = options[prefix + 'pos'][0];
    p.y = options[prefix + 'pos'][1];
    p.z = options[prefix + 'pos'][2];
  }
  if(options[prefix + 'rot']) {
    p.ax =  options[prefix + 'rot'][0];
    p.ay =  options[prefix + 'rot'][1];
    p.az =  options[prefix + 'rot'][2];
  }
  if(options[prefix + 'rot_post']) {
    p.bx =  options[prefix + 'rot_post'][0];
    p.by =  options[prefix + 'rot_post'][1];
    p.bz =  options[prefix + 'rot_post'][2];
  }
  if(options[prefix + 'scale']) {
    p.sx =  options[prefix + 'scale'][0];
    p.sy =  options[prefix + 'scale'][1];
  }
  if(options[prefix + 'width'] !== undefined) {
    p.width =  options[prefix + 'width'];
  }
  if(options[prefix + 'height'] !== undefined) {
    p.height =  options[prefix + 'height'];
  }
  if(options[prefix + 'opacity'] !== undefined) {
    p.opacity =  options[prefix + 'opacity'];
  }
  return p;
}


function snabbt(e, options) {
  if(e == 'scroll')
    return snabbtjs.setup_scroll_animation(options);
  if(e == 'attention')
    return snabbtjs.setup_attention_animation(options);


  var start = new snabbtjs.State({});
  start = state_from_options(start, options, 'from_');
  var end = new snabbtjs.State({});
  end = state_from_options(end, options, '');

  var anim_options = {
    start_state: start,
    end_state: end,
    duration: options.duration || 1000,
    delay: options.delay || 0,
    offset: options.offset
  };
  if(options.easing)
    anim_options.easing = snabbtjs.EASING_FUNCS[options.easing];
  if(options.manual)
    anim_options.mode = snabbtjs.AnimationType.MANUAL;
  var animation = new snabbtjs.Animation(anim_options);

  var queue = [];
  var chainer = {
    then: function(opts) {
      queue.unshift(opts);
      return chainer;
    }
  };

  function tick(time) {
    animation.tick(time);
    var current_state = animation.current_state();
    snabbtjs.set_css(e, current_state);

    if(animation.completed()) {
      var end_state = animation.end_state();
      snabbtjs.set_css(e, end_state);

      if(options.loop > 1) {
        options.loop -= 1;
        animation.assign(anim_options);
        requestAnimFrame(tick);
      } else {
        if(options.callback) {
          options.callback();
        }
        if(queue.length) {
          options = queue.pop();

          start = state_from_options(end, options, 'from_');
          end = state_from_options(new snabbtjs.State({}), options, '');
          animation.assign({
            start_state: start,
            end_state: end,
            duration: options.duration || 1000,
            delay: options.delay || 0,
            offset: options.offset
          });
          if(options.easing)
            animation.easing = snabbtjs.EASING_FUNCS[options.easing];

          animation.tick(time);
          requestAnimFrame(tick);
        }
      }
    } else {
      requestAnimFrame(tick);
    }
  }

  requestAnimFrame(tick);
  if(options.manual) 
    return animation;
  else
    return chainer;
}

snabbtjs.setup_scroll_animation = function(options) {
  var animation = new snabbtjs.ScrollAnimation(options);

  function tick(time) {
    animation.tick(time);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  }
  requestAnimFrame(tick);
};

snabbtjs.setup_attention_animation = function(options) {

  var animation = new snabbtjs.AttentionAnimation(options);

  function tick(time) {
    animation.tick(time);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  };
  requestAnimFrame(tick);
};
;var snabbtjs = snabbtjs || {};

snabbtjs.assigned_matrix_multiplication = function(a, b, res) {
  // Unrolled loop
  res[0] = a[0] * b[0] +
           a[1] * b[4] +
           a[2] * b[8] +
           a[3] * b[12];
  res[1] = a[0] * b[1] +
           a[1] * b[5] +
           a[2] * b[9] +
           a[3] * b[13];
  res[2] = a[0] * b[2] +
           a[1] * b[6] +
           a[2] * b[10] +
           a[3] * b[14];
  res[3] = a[0] * b[3] +
           a[1] * b[7] +
           a[2] * b[11] +
           a[3] * b[15];

  res[4] = a[4] * b[0] +
           a[5] * b[4] +
           a[6] * b[8] +
           a[7] * b[12];
  res[5] = a[4] * b[1] +
           a[5] * b[5] +
           a[6] * b[9] +
           a[7] * b[13];
  res[6] = a[4] * b[2] +
           a[5] * b[6] +
           a[6] * b[10] +
           a[7] * b[14];
  res[7] = a[4] * b[3] +
           a[5] * b[7] +
           a[6] * b[11] +
           a[7] * b[15];

  res[8] = a[8] * b[0] +
           a[9] * b[4] +
           a[10] * b[8] +
           a[11] * b[12];
  res[9] = a[8] * b[1] +
           a[9] * b[5] +
           a[10] * b[9] +
           a[11] * b[13];
  res[10] = a[8] * b[2] +
            a[9] * b[6] +
            a[10] * b[10] +
            a[11] * b[14];
  res[11] = a[8] * b[3] +
            a[9] * b[7] +
            a[10] * b[11] +
            a[11] * b[15];

  res[12] = a[12] * b[0] +
            a[13] * b[4] +
            a[14] * b[8] +
            a[15] * b[12];
  res[13] = a[12] * b[1] +
            a[13] * b[5] +
            a[14] * b[9] +
            a[15] * b[13];
  res[14] = a[12] * b[2] +
            a[13] * b[6] +
            a[14] * b[10] +
            a[15] * b[14];
  res[15] = a[12] * b[3] +
            a[13] * b[7] +
            a[14] * b[11] +
            a[15] * b[15];

  return res;
};

//snabbtjs.mat_to_css = function(matrix) {
//  var css = 'matrix3d(';
//  var MIN = 0.00000001;
//  for(var i=0;i<matrix.length-1;++i) {
//    if(matrix[i] < MIN)
//      css += '0,';
//    else
//      css += matrix[i].toFixed(10) + ",";
//  }
//  if(matrix[15] < MIN)
//    css += '0';
//  else
//    css += matrix[15].toFixed(10);
//  return css + ")";
//};

snabbtjs.mat_to_css = function(matrix) {
  var css = 'matrix3d(' +
            matrix[0].toFixed(10) + ', ' +
            matrix[1].toFixed(10) + ', ' +
            matrix[2].toFixed(10) + ', ' +
            matrix[3].toFixed(10) + ', ' +
            matrix[4].toFixed(10) + ', ' +
            matrix[5].toFixed(10) + ', ' +
            matrix[6].toFixed(10) + ', ' +
            matrix[7].toFixed(10) + ', ' +
            matrix[8].toFixed(10) + ', ' +
            matrix[9].toFixed(10) + ', ' +
            matrix[10].toFixed(10) + ', ' +
            matrix[11].toFixed(10) + ', ' +
            matrix[12].toFixed(10) + ', ' +
            matrix[13].toFixed(10) + ', ' +
            matrix[14].toFixed(10) + ', ' +
            matrix[15].toFixed(10) + ')';
  return css;
};

snabbtjs.mult = function(a, b) {
  var m = new Float32Array(16);
  snabbtjs.assigned_matrix_multiplication(a, b, m);
  return m;
};

snabbtjs.rotX = function(rad) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.assign_rotX = function(m, rad) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotY = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotY = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotZ = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotZ = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.trans = function(x, y, z) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.assign_trans = function(m, x, y, z) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.scale = function(x, y) {
  return new Float32Array([
     x, 0, 0, 0,
     0, y, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_scale = function(m, x, y) {
  m[0] = x; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = y; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.ident = function() {
  return new Float32Array([
     1, 0, 0, 0,
     0, 1, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_ident = function(m) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.set_css = function(el, state) {
  var matrix = state.as_matrix();
  if(el.hasOwnProperty('length')) {
    for(var i=0;i<el.length;++i) {
      el[i].style.webkitTransform = snabbtjs.mat_to_css(matrix);
      el[i].style.transform = snabbtjs.mat_to_css(matrix);
      if(state.width !== undefined)
        el[i].style.width = state.width + 'px';
      if(state.height !== undefined)
        el[i].style.height = state.height + 'px';
      if(state.opacity !== undefined)
        el[i].style.opacity = state.opacity;
    }
  } else {
    el.style.webkitTransform = snabbtjs.mat_to_css(matrix);
    el.style.transform = snabbtjs.mat_to_css(matrix);
    if(state.width !== undefined)
      el.style.width = state.width + 'px';
    if(state.height !== undefined)
      el.style.height = state.height + 'px';
    if(state.opacity !== undefined)
      el.style.opacity = state.opacity;
  }
};

;snabbtjs.State = function(config) {
  this.ax = config.ax || 0;
  this.ay = config.ay || 0;
  this.az = config.az || 0;
  this.x = config.x || 0;
  this.y = config.y || 0;
  this.z = config.z || 0;
  this.bx = config.bx || 0;
  this.by = config.by || 0;
  this.bz = config.bz || 0;
  this.offset_x = config.offset_x || 0;
  this.offset_y = config.offset_y || 0;
  this.offset_z = config.offset_z || 0;
  this.sx = config.sx || 1;
  this.sy = config.sy || 1;
  this.width = config.width;
  this.height = config.height;
  this.opacity = config.opacity;
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
    sx: this.sx,
    sy: this.sy,
    height: this.height,
    width: this.width,
    opacity: this.opacity
  });
  return p;
};

snabbtjs.State.prototype.assign = function(p) {
  this.ax = p.ax;
  this.ay = p.ay;
  this.az = p.az;
  this.x = p.x;
  this.y = p.y;
  this.z = p.z;
  this.bx = p.bx;
  this.by = p.by;
  this.bz = p.bz;
  this.sx = p.sx;
  this.sy = p.sy;
  this.opacity = p.opacity;
};

//  Reuse the same three matrices everytime.
var temp_m = snabbtjs.ident();
var temp_res1 = snabbtjs.ident();
var temp_res2 = snabbtjs.ident();

snabbtjs.State.prototype.as_matrix = function() {
  // Scale
  snabbtjs.assign_scale(temp_res1, this.sx, this.sy);

  // Pre-rotation
  snabbtjs.assign_rotX(temp_res2, this.ax);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_res2, temp_m);

  snabbtjs.assign_rotY(temp_res1, this.ay);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_m, temp_res2);
  snabbtjs.assign_rotZ(temp_m, this.az);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res2, temp_res1);

  // Translation
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_trans(temp_m, this.x, this.y, this.z), temp_res2);

  // Post-rotation
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotX(temp_m, this.bx), temp_res1);
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_rotY(temp_m, this.by), temp_res2);
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotZ(temp_m, this.bz), temp_res1);

  // Final offset
  snabbtjs.assign_trans(temp_m, this.offset_x, this.offset_y, this.offset_z);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res1, temp_res2);
  return temp_res2;
};

;
queue_length = 100;
tick_requests = Array(queue_length);
tick_start = 0;
tick_end = 0;


function requestAnimFrame(func) {
  tick_requests[tick_end] = func;
  tick_end = (tick_end + 1) % queue_length;
}

function master_tick(time) {
  if(tick_start != tick_end) {
    var curr_end = tick_end;
    for(var i=tick_start;i<curr_end + queue_length; ++i) {
      var real_i = i % tick_requests.length;
      tick_requests[real_i](time);
    }
    tick_start = curr_end;
  }
  window.requestAnimationFrame(master_tick);
  //var length = tick_requests.length;
  //for(var i=0;i<length;++i) {
  //  tick_requests[i](time);
  //}
  //tick_requests.splice(0, length);
}

window.requestAnimationFrame(master_tick);

function state_from_options(p, options, prefix) {

  if(options[prefix + 'pos']) {
    p.x = options[prefix + 'pos'][0];
    p.y = options[prefix + 'pos'][1];
    p.z = options[prefix + 'pos'][2];
  }
  if(options[prefix + 'rot']) {
    p.ax =  options[prefix + 'rot'][0];
    p.ay =  options[prefix + 'rot'][1];
    p.az =  options[prefix + 'rot'][2];
  }
  if(options[prefix + 'rot_post']) {
    p.bx =  options[prefix + 'rot_post'][0];
    p.by =  options[prefix + 'rot_post'][1];
    p.bz =  options[prefix + 'rot_post'][2];
  }
  if(options[prefix + 'scale']) {
    p.sx =  options[prefix + 'scale'][0];
    p.sy =  options[prefix + 'scale'][1];
  }
  if(options[prefix + 'width'] !== undefined) {
    p.width =  options[prefix + 'width'];
  }
  if(options[prefix + 'height'] !== undefined) {
    p.height =  options[prefix + 'height'];
  }
  if(options[prefix + 'opacity'] !== undefined) {
    p.opacity =  options[prefix + 'opacity'];
  }
  return p;
}


function snabbt(e, options) {
  if(e == 'scroll')
    return snabbtjs.setup_scroll_animation(options);
  if(e == 'attention')
    return snabbtjs.setup_attention_animation(options);


  var start = new snabbtjs.State({});
  start = state_from_options(start, options, 'from_');
  var end = new snabbtjs.State({});
  end = state_from_options(end, options, '');

  var anim_options = {
    start_state: start,
    end_state: end,
    duration: options.duration || 1000,
    delay: options.delay || 0,
    offset: options.offset
  };
  if(options.easing)
    anim_options.easing = snabbtjs.EASING_FUNCS[options.easing];
  if(options.manual)
    anim_options.mode = snabbtjs.AnimationType.MANUAL;
  var animation = new snabbtjs.Animation(anim_options);

  var queue = [];
  var chainer = {
    then: function(opts) {
      queue.unshift(opts);
      return chainer;
    }
  };

  function tick(time) {
    animation.tick(time);
    var current_state = animation.current_state();
    snabbtjs.set_css(e, current_state);

    if(animation.completed()) {
      var end_state = animation.end_state();
      snabbtjs.set_css(e, end_state);

      if(options.loop > 1) {
        options.loop -= 1;
        animation.assign(anim_options);
        requestAnimFrame(tick);
      } else {
        if(options.callback) {
          options.callback();
        }
        if(queue.length) {
          options = queue.pop();

          start = state_from_options(end, options, 'from_');
          end = state_from_options(new snabbtjs.State({}), options, '');
          animation.assign({
            start_state: start,
            end_state: end,
            duration: options.duration || 1000,
            delay: options.delay || 0,
            offset: options.offset
          });
          if(options.easing)
            animation.easing = snabbtjs.EASING_FUNCS[options.easing];

          animation.tick(time);
          requestAnimFrame(tick);
        }
      }
    } else {
      requestAnimFrame(tick);
    }
  }

  requestAnimFrame(tick);
  if(options.manual) 
    return animation;
  else
    return chainer;
}

snabbtjs.setup_scroll_animation = function(options) {
  var animation = new snabbtjs.ScrollAnimation(options);

  function tick(time) {
    animation.tick(time);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  }
  requestAnimFrame(tick);
};

snabbtjs.setup_attention_animation = function(options) {

  var animation = new snabbtjs.AttentionAnimation(options);

  function tick(time) {
    animation.tick(time);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  };
  requestAnimFrame(tick);
};
;var snabbtjs = snabbtjs || {};

snabbtjs.assigned_matrix_multiplication = function(a, b, res) {
  // Unrolled loop
  res[0] = a[0] * b[0] +
           a[1] * b[4] +
           a[2] * b[8] +
           a[3] * b[12];
  res[1] = a[0] * b[1] +
           a[1] * b[5] +
           a[2] * b[9] +
           a[3] * b[13];
  res[2] = a[0] * b[2] +
           a[1] * b[6] +
           a[2] * b[10] +
           a[3] * b[14];
  res[3] = a[0] * b[3] +
           a[1] * b[7] +
           a[2] * b[11] +
           a[3] * b[15];

  res[4] = a[4] * b[0] +
           a[5] * b[4] +
           a[6] * b[8] +
           a[7] * b[12];
  res[5] = a[4] * b[1] +
           a[5] * b[5] +
           a[6] * b[9] +
           a[7] * b[13];
  res[6] = a[4] * b[2] +
           a[5] * b[6] +
           a[6] * b[10] +
           a[7] * b[14];
  res[7] = a[4] * b[3] +
           a[5] * b[7] +
           a[6] * b[11] +
           a[7] * b[15];

  res[8] = a[8] * b[0] +
           a[9] * b[4] +
           a[10] * b[8] +
           a[11] * b[12];
  res[9] = a[8] * b[1] +
           a[9] * b[5] +
           a[10] * b[9] +
           a[11] * b[13];
  res[10] = a[8] * b[2] +
            a[9] * b[6] +
            a[10] * b[10] +
            a[11] * b[14];
  res[11] = a[8] * b[3] +
            a[9] * b[7] +
            a[10] * b[11] +
            a[11] * b[15];

  res[12] = a[12] * b[0] +
            a[13] * b[4] +
            a[14] * b[8] +
            a[15] * b[12];
  res[13] = a[12] * b[1] +
            a[13] * b[5] +
            a[14] * b[9] +
            a[15] * b[13];
  res[14] = a[12] * b[2] +
            a[13] * b[6] +
            a[14] * b[10] +
            a[15] * b[14];
  res[15] = a[12] * b[3] +
            a[13] * b[7] +
            a[14] * b[11] +
            a[15] * b[15];

  return res;
};

//snabbtjs.mat_to_css = function(matrix) {
//  var css = 'matrix3d(';
//  var MIN = 0.00000001;
//  for(var i=0;i<matrix.length-1;++i) {
//    if(matrix[i] < MIN)
//      css += '0,';
//    else
//      css += matrix[i].toFixed(10) + ",";
//  }
//  if(matrix[15] < MIN)
//    css += '0';
//  else
//    css += matrix[15].toFixed(10);
//  return css + ")";
//};

snabbtjs.mat_to_css = function(matrix) {
  var css = 'matrix3d(' +
            matrix[0].toFixed(10) + ', ' +
            matrix[1].toFixed(10) + ', ' +
            matrix[2].toFixed(10) + ', ' +
            matrix[3].toFixed(10) + ', ' +
            matrix[4].toFixed(10) + ', ' +
            matrix[5].toFixed(10) + ', ' +
            matrix[6].toFixed(10) + ', ' +
            matrix[7].toFixed(10) + ', ' +
            matrix[8].toFixed(10) + ', ' +
            matrix[9].toFixed(10) + ', ' +
            matrix[10].toFixed(10) + ', ' +
            matrix[11].toFixed(10) + ', ' +
            matrix[12].toFixed(10) + ', ' +
            matrix[13].toFixed(10) + ', ' +
            matrix[14].toFixed(10) + ', ' +
            matrix[15].toFixed(10) + ')';
  return css;
};

snabbtjs.mult = function(a, b) {
  var m = new Float32Array(16);
  snabbtjs.assigned_matrix_multiplication(a, b, m);
  return m;
};

snabbtjs.rotX = function(rad) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.assign_rotX = function(m, rad) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotY = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotY = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotZ = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotZ = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.trans = function(x, y, z) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.assign_trans = function(m, x, y, z) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.scale = function(x, y) {
  return new Float32Array([
     x, 0, 0, 0,
     0, y, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_scale = function(m, x, y) {
  m[0] = x; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = y; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.ident = function() {
  return new Float32Array([
     1, 0, 0, 0,
     0, 1, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_ident = function(m) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.set_css = function(el, state) {
  var matrix = state.as_matrix();
  if(el.hasOwnProperty('length')) {
    for(var i=0;i<el.length;++i) {
      el[i].style.webkitTransform = snabbtjs.mat_to_css(matrix);
      el[i].style.transform = snabbtjs.mat_to_css(matrix);
      if(state.width !== undefined)
        el[i].style.width = state.width + 'px';
      if(state.height !== undefined)
        el[i].style.height = state.height + 'px';
      if(state.opacity !== undefined)
        el[i].style.opacity = state.opacity;
    }
  } else {
    el.style.webkitTransform = snabbtjs.mat_to_css(matrix);
    el.style.transform = snabbtjs.mat_to_css(matrix);
    if(state.width !== undefined)
      el.style.width = state.width + 'px';
    if(state.height !== undefined)
      el.style.height = state.height + 'px';
    if(state.opacity !== undefined)
      el.style.opacity = state.opacity;
  }
};

;snabbtjs.State = function(config) {
  this.ax = config.ax || 0;
  this.ay = config.ay || 0;
  this.az = config.az || 0;
  this.x = config.x || 0;
  this.y = config.y || 0;
  this.z = config.z || 0;
  this.bx = config.bx || 0;
  this.by = config.by || 0;
  this.bz = config.bz || 0;
  this.offset_x = config.offset_x || 0;
  this.offset_y = config.offset_y || 0;
  this.offset_z = config.offset_z || 0;
  this.sx = config.sx || 1;
  this.sy = config.sy || 1;
  this.width = config.width;
  this.height = config.height;
  this.opacity = config.opacity;
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
    sx: this.sx,
    sy: this.sy,
    height: this.height,
    width: this.width,
    opacity: this.opacity
  });
  return p;
};

snabbtjs.State.prototype.assign = function(p) {
  this.ax = p.ax;
  this.ay = p.ay;
  this.az = p.az;
  this.x = p.x;
  this.y = p.y;
  this.z = p.z;
  this.bx = p.bx;
  this.by = p.by;
  this.bz = p.bz;
  this.sx = p.sx;
  this.sy = p.sy;
  this.opacity = p.opacity;
};

//  Reuse the same three matrices everytime.
var temp_m = snabbtjs.ident();
var temp_res1 = snabbtjs.ident();
var temp_res2 = snabbtjs.ident();

snabbtjs.State.prototype.as_matrix = function() {
  // Scale
  snabbtjs.assign_scale(temp_res1, this.sx, this.sy);

  // Pre-rotation
  snabbtjs.assign_rotX(temp_res2, this.ax);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_res2, temp_m);

  snabbtjs.assign_rotY(temp_res1, this.ay);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_m, temp_res2);
  snabbtjs.assign_rotZ(temp_m, this.az);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res2, temp_res1);

  // Translation
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_trans(temp_m, this.x, this.y, this.z), temp_res2);

  // Post-rotation
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotX(temp_m, this.bx), temp_res1);
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_rotY(temp_m, this.by), temp_res2);
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotZ(temp_m, this.bz), temp_res1);

  // Final offset
  snabbtjs.assign_trans(temp_m, this.offset_x, this.offset_y, this.offset_z);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res1, temp_res2);
  return temp_res2;
};

;
queue_length = 100;
tick_requests = [];
tick_start = 0;
tick_end = 0;


function requestAnimFrame(func) {
  tick_requests.push(func);
  //tick_requests[tick_end] = func;
  //tick_end = (tick_end + 1) % queue_length;
}

function master_tick(time) {
  //if(tick_start != tick_end) {
  //  var curr_end = tick_end;
  //  for(var i=tick_start;i<curr_end + queue_length; ++i) {
  //    var real_i = i % tick_requests.length;
  //    tick_requests[real_i](time);
  //  }
  //  tick_start = curr_end;
  //}
  //var length = tick_requests.length;
  for(var i=0;i<length;++i) {
    tick_requests[i](time);
  }
  tick_requests.splice(0, length);
  window.requestAnimationFrame(master_tick);
}

window.requestAnimationFrame(master_tick);

function state_from_options(p, options, prefix) {

  if(options[prefix + 'pos']) {
    p.x = options[prefix + 'pos'][0];
    p.y = options[prefix + 'pos'][1];
    p.z = options[prefix + 'pos'][2];
  }
  if(options[prefix + 'rot']) {
    p.ax =  options[prefix + 'rot'][0];
    p.ay =  options[prefix + 'rot'][1];
    p.az =  options[prefix + 'rot'][2];
  }
  if(options[prefix + 'rot_post']) {
    p.bx =  options[prefix + 'rot_post'][0];
    p.by =  options[prefix + 'rot_post'][1];
    p.bz =  options[prefix + 'rot_post'][2];
  }
  if(options[prefix + 'scale']) {
    p.sx =  options[prefix + 'scale'][0];
    p.sy =  options[prefix + 'scale'][1];
  }
  if(options[prefix + 'width'] !== undefined) {
    p.width =  options[prefix + 'width'];
  }
  if(options[prefix + 'height'] !== undefined) {
    p.height =  options[prefix + 'height'];
  }
  if(options[prefix + 'opacity'] !== undefined) {
    p.opacity =  options[prefix + 'opacity'];
  }
  return p;
}


function snabbt(e, options) {
  if(e == 'scroll')
    return snabbtjs.setup_scroll_animation(options);
  if(e == 'attention')
    return snabbtjs.setup_attention_animation(options);


  var start = new snabbtjs.State({});
  start = state_from_options(start, options, 'from_');
  var end = new snabbtjs.State({});
  end = state_from_options(end, options, '');

  var anim_options = {
    start_state: start,
    end_state: end,
    duration: options.duration || 1000,
    delay: options.delay || 0,
    offset: options.offset
  };
  if(options.easing)
    anim_options.easing = snabbtjs.EASING_FUNCS[options.easing];
  if(options.manual)
    anim_options.mode = snabbtjs.AnimationType.MANUAL;
  var animation = new snabbtjs.Animation(anim_options);

  var queue = [];
  var chainer = {
    then: function(opts) {
      queue.unshift(opts);
      return chainer;
    }
  };

  function tick(time) {
    animation.tick(time);
    var current_state = animation.current_state();
    snabbtjs.set_css(e, current_state);

    if(animation.completed()) {
      var end_state = animation.end_state();
      snabbtjs.set_css(e, end_state);

      if(options.loop > 1) {
        options.loop -= 1;
        animation.assign(anim_options);
        requestAnimFrame(tick);
      } else {
        if(options.callback) {
          options.callback();
        }
        if(queue.length) {
          options = queue.pop();

          start = state_from_options(end, options, 'from_');
          end = state_from_options(new snabbtjs.State({}), options, '');
          animation.assign({
            start_state: start,
            end_state: end,
            duration: options.duration || 1000,
            delay: options.delay || 0,
            offset: options.offset
          });
          if(options.easing)
            animation.easing = snabbtjs.EASING_FUNCS[options.easing];

          animation.tick(time);
          requestAnimFrame(tick);
        }
      }
    } else {
      requestAnimFrame(tick);
    }
  }

  requestAnimFrame(tick);
  if(options.manual) 
    return animation;
  else
    return chainer;
}

snabbtjs.setup_scroll_animation = function(options) {
  var animation = new snabbtjs.ScrollAnimation(options);

  function tick(time) {
    animation.tick(time);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  }
  requestAnimFrame(tick);
};

snabbtjs.setup_attention_animation = function(options) {

  var animation = new snabbtjs.AttentionAnimation(options);

  function tick(time) {
    animation.tick(time);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  };
  requestAnimFrame(tick);
};
;var snabbtjs = snabbtjs || {};

snabbtjs.assigned_matrix_multiplication = function(a, b, res) {
  // Unrolled loop
  res[0] = a[0] * b[0] +
           a[1] * b[4] +
           a[2] * b[8] +
           a[3] * b[12];
  res[1] = a[0] * b[1] +
           a[1] * b[5] +
           a[2] * b[9] +
           a[3] * b[13];
  res[2] = a[0] * b[2] +
           a[1] * b[6] +
           a[2] * b[10] +
           a[3] * b[14];
  res[3] = a[0] * b[3] +
           a[1] * b[7] +
           a[2] * b[11] +
           a[3] * b[15];

  res[4] = a[4] * b[0] +
           a[5] * b[4] +
           a[6] * b[8] +
           a[7] * b[12];
  res[5] = a[4] * b[1] +
           a[5] * b[5] +
           a[6] * b[9] +
           a[7] * b[13];
  res[6] = a[4] * b[2] +
           a[5] * b[6] +
           a[6] * b[10] +
           a[7] * b[14];
  res[7] = a[4] * b[3] +
           a[5] * b[7] +
           a[6] * b[11] +
           a[7] * b[15];

  res[8] = a[8] * b[0] +
           a[9] * b[4] +
           a[10] * b[8] +
           a[11] * b[12];
  res[9] = a[8] * b[1] +
           a[9] * b[5] +
           a[10] * b[9] +
           a[11] * b[13];
  res[10] = a[8] * b[2] +
            a[9] * b[6] +
            a[10] * b[10] +
            a[11] * b[14];
  res[11] = a[8] * b[3] +
            a[9] * b[7] +
            a[10] * b[11] +
            a[11] * b[15];

  res[12] = a[12] * b[0] +
            a[13] * b[4] +
            a[14] * b[8] +
            a[15] * b[12];
  res[13] = a[12] * b[1] +
            a[13] * b[5] +
            a[14] * b[9] +
            a[15] * b[13];
  res[14] = a[12] * b[2] +
            a[13] * b[6] +
            a[14] * b[10] +
            a[15] * b[14];
  res[15] = a[12] * b[3] +
            a[13] * b[7] +
            a[14] * b[11] +
            a[15] * b[15];

  return res;
};

//snabbtjs.mat_to_css = function(matrix) {
//  var css = 'matrix3d(';
//  var MIN = 0.00000001;
//  for(var i=0;i<matrix.length-1;++i) {
//    if(matrix[i] < MIN)
//      css += '0,';
//    else
//      css += matrix[i].toFixed(10) + ",";
//  }
//  if(matrix[15] < MIN)
//    css += '0';
//  else
//    css += matrix[15].toFixed(10);
//  return css + ")";
//};

snabbtjs.mat_to_css = function(matrix) {
  var css = 'matrix3d(' +
            matrix[0].toFixed(10) + ', ' +
            matrix[1].toFixed(10) + ', ' +
            matrix[2].toFixed(10) + ', ' +
            matrix[3].toFixed(10) + ', ' +
            matrix[4].toFixed(10) + ', ' +
            matrix[5].toFixed(10) + ', ' +
            matrix[6].toFixed(10) + ', ' +
            matrix[7].toFixed(10) + ', ' +
            matrix[8].toFixed(10) + ', ' +
            matrix[9].toFixed(10) + ', ' +
            matrix[10].toFixed(10) + ', ' +
            matrix[11].toFixed(10) + ', ' +
            matrix[12].toFixed(10) + ', ' +
            matrix[13].toFixed(10) + ', ' +
            matrix[14].toFixed(10) + ', ' +
            matrix[15].toFixed(10) + ')';
  return css;
};

snabbtjs.mult = function(a, b) {
  var m = new Float32Array(16);
  snabbtjs.assigned_matrix_multiplication(a, b, m);
  return m;
};

snabbtjs.rotX = function(rad) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.assign_rotX = function(m, rad) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotY = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotY = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotZ = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotZ = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.trans = function(x, y, z) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.assign_trans = function(m, x, y, z) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.scale = function(x, y) {
  return new Float32Array([
     x, 0, 0, 0,
     0, y, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_scale = function(m, x, y) {
  m[0] = x; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = y; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.ident = function() {
  return new Float32Array([
     1, 0, 0, 0,
     0, 1, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_ident = function(m) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.set_css = function(el, state) {
  var matrix = state.as_matrix();
  if(el.hasOwnProperty('length')) {
    for(var i=0;i<el.length;++i) {
      el[i].style.webkitTransform = snabbtjs.mat_to_css(matrix);
      el[i].style.transform = snabbtjs.mat_to_css(matrix);
      if(state.width !== undefined)
        el[i].style.width = state.width + 'px';
      if(state.height !== undefined)
        el[i].style.height = state.height + 'px';
      if(state.opacity !== undefined)
        el[i].style.opacity = state.opacity;
    }
  } else {
    el.style.webkitTransform = snabbtjs.mat_to_css(matrix);
    el.style.transform = snabbtjs.mat_to_css(matrix);
    if(state.width !== undefined)
      el.style.width = state.width + 'px';
    if(state.height !== undefined)
      el.style.height = state.height + 'px';
    if(state.opacity !== undefined)
      el.style.opacity = state.opacity;
  }
};

;snabbtjs.State = function(config) {
  this.ax = config.ax || 0;
  this.ay = config.ay || 0;
  this.az = config.az || 0;
  this.x = config.x || 0;
  this.y = config.y || 0;
  this.z = config.z || 0;
  this.bx = config.bx || 0;
  this.by = config.by || 0;
  this.bz = config.bz || 0;
  this.offset_x = config.offset_x || 0;
  this.offset_y = config.offset_y || 0;
  this.offset_z = config.offset_z || 0;
  this.sx = config.sx || 1;
  this.sy = config.sy || 1;
  this.width = config.width;
  this.height = config.height;
  this.opacity = config.opacity;
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
    sx: this.sx,
    sy: this.sy,
    height: this.height,
    width: this.width,
    opacity: this.opacity
  });
  return p;
};

snabbtjs.State.prototype.assign = function(p) {
  this.ax = p.ax;
  this.ay = p.ay;
  this.az = p.az;
  this.x = p.x;
  this.y = p.y;
  this.z = p.z;
  this.bx = p.bx;
  this.by = p.by;
  this.bz = p.bz;
  this.sx = p.sx;
  this.sy = p.sy;
  this.opacity = p.opacity;
};

//  Reuse the same three matrices everytime.
var temp_m = snabbtjs.ident();
var temp_res1 = snabbtjs.ident();
var temp_res2 = snabbtjs.ident();

snabbtjs.State.prototype.as_matrix = function() {
  // Scale
  snabbtjs.assign_scale(temp_res1, this.sx, this.sy);

  // Pre-rotation
  snabbtjs.assign_rotX(temp_res2, this.ax);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_res2, temp_m);

  snabbtjs.assign_rotY(temp_res1, this.ay);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_m, temp_res2);
  snabbtjs.assign_rotZ(temp_m, this.az);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res2, temp_res1);

  // Translation
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_trans(temp_m, this.x, this.y, this.z), temp_res2);

  // Post-rotation
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotX(temp_m, this.bx), temp_res1);
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_rotY(temp_m, this.by), temp_res2);
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotZ(temp_m, this.bz), temp_res1);

  // Final offset
  snabbtjs.assign_trans(temp_m, this.offset_x, this.offset_y, this.offset_z);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res1, temp_res2);
  return temp_res2;
};

;
queue_length = 100;
tick_requests = [];
tick_start = 0;
tick_end = 0;


function requestAnimFrame(func) {
  tick_requests.push(func);
  //tick_requests[tick_end] = func;
  //tick_end = (tick_end + 1) % queue_length;
}

function master_tick(time) {
  //if(tick_start != tick_end) {
  //  var curr_end = tick_end;
  //  for(var i=tick_start;i<curr_end + queue_length; ++i) {
  //    var real_i = i % tick_requests.length;
  //    tick_requests[real_i](time);
  //  }
  //  tick_start = curr_end;
  //}
  var len = tick_requests.length;
  for(var i=0;i<len;++i) {
    tick_requests[i](time);
  }
  tick_requests.splice(0, len);
  window.requestAnimationFrame(master_tick);
}

window.requestAnimationFrame(master_tick);

function state_from_options(p, options, prefix) {

  if(options[prefix + 'pos']) {
    p.x = options[prefix + 'pos'][0];
    p.y = options[prefix + 'pos'][1];
    p.z = options[prefix + 'pos'][2];
  }
  if(options[prefix + 'rot']) {
    p.ax =  options[prefix + 'rot'][0];
    p.ay =  options[prefix + 'rot'][1];
    p.az =  options[prefix + 'rot'][2];
  }
  if(options[prefix + 'rot_post']) {
    p.bx =  options[prefix + 'rot_post'][0];
    p.by =  options[prefix + 'rot_post'][1];
    p.bz =  options[prefix + 'rot_post'][2];
  }
  if(options[prefix + 'scale']) {
    p.sx =  options[prefix + 'scale'][0];
    p.sy =  options[prefix + 'scale'][1];
  }
  if(options[prefix + 'width'] !== undefined) {
    p.width =  options[prefix + 'width'];
  }
  if(options[prefix + 'height'] !== undefined) {
    p.height =  options[prefix + 'height'];
  }
  if(options[prefix + 'opacity'] !== undefined) {
    p.opacity =  options[prefix + 'opacity'];
  }
  return p;
}


function snabbt(e, options) {
  if(e == 'scroll')
    return snabbtjs.setup_scroll_animation(options);
  if(e == 'attention')
    return snabbtjs.setup_attention_animation(options);


  var start = new snabbtjs.State({});
  start = state_from_options(start, options, 'from_');
  var end = new snabbtjs.State({});
  end = state_from_options(end, options, '');

  var anim_options = {
    start_state: start,
    end_state: end,
    duration: options.duration || 1000,
    delay: options.delay || 0,
    offset: options.offset
  };
  if(options.easing)
    anim_options.easing = snabbtjs.EASING_FUNCS[options.easing];
  if(options.manual)
    anim_options.mode = snabbtjs.AnimationType.MANUAL;
  var animation = new snabbtjs.Animation(anim_options);

  var queue = [];
  var chainer = {
    then: function(opts) {
      queue.unshift(opts);
      return chainer;
    }
  };

  function tick(time) {
    animation.tick(time);
    var current_state = animation.current_state();
    snabbtjs.set_css(e, current_state);

    if(animation.completed()) {
      var end_state = animation.end_state();
      snabbtjs.set_css(e, end_state);

      if(options.loop > 1) {
        options.loop -= 1;
        animation.assign(anim_options);
        requestAnimFrame(tick);
      } else {
        if(options.callback) {
          options.callback();
        }
        if(queue.length) {
          options = queue.pop();

          start = state_from_options(end, options, 'from_');
          end = state_from_options(new snabbtjs.State({}), options, '');
          animation.assign({
            start_state: start,
            end_state: end,
            duration: options.duration || 1000,
            delay: options.delay || 0,
            offset: options.offset
          });
          if(options.easing)
            animation.easing = snabbtjs.EASING_FUNCS[options.easing];

          animation.tick(time);
          requestAnimFrame(tick);
        }
      }
    } else {
      requestAnimFrame(tick);
    }
  }

  requestAnimFrame(tick);
  if(options.manual) 
    return animation;
  else
    return chainer;
}

snabbtjs.setup_scroll_animation = function(options) {
  var animation = new snabbtjs.ScrollAnimation(options);

  function tick(time) {
    animation.tick(time);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  }
  requestAnimFrame(tick);
};

snabbtjs.setup_attention_animation = function(options) {

  var animation = new snabbtjs.AttentionAnimation(options);

  function tick(time) {
    animation.tick(time);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  };
  requestAnimFrame(tick);
};
;var snabbtjs = snabbtjs || {};

snabbtjs.assigned_matrix_multiplication = function(a, b, res) {
  // Unrolled loop
  res[0] = a[0] * b[0] +
           a[1] * b[4] +
           a[2] * b[8] +
           a[3] * b[12];
  res[1] = a[0] * b[1] +
           a[1] * b[5] +
           a[2] * b[9] +
           a[3] * b[13];
  res[2] = a[0] * b[2] +
           a[1] * b[6] +
           a[2] * b[10] +
           a[3] * b[14];
  res[3] = a[0] * b[3] +
           a[1] * b[7] +
           a[2] * b[11] +
           a[3] * b[15];

  res[4] = a[4] * b[0] +
           a[5] * b[4] +
           a[6] * b[8] +
           a[7] * b[12];
  res[5] = a[4] * b[1] +
           a[5] * b[5] +
           a[6] * b[9] +
           a[7] * b[13];
  res[6] = a[4] * b[2] +
           a[5] * b[6] +
           a[6] * b[10] +
           a[7] * b[14];
  res[7] = a[4] * b[3] +
           a[5] * b[7] +
           a[6] * b[11] +
           a[7] * b[15];

  res[8] = a[8] * b[0] +
           a[9] * b[4] +
           a[10] * b[8] +
           a[11] * b[12];
  res[9] = a[8] * b[1] +
           a[9] * b[5] +
           a[10] * b[9] +
           a[11] * b[13];
  res[10] = a[8] * b[2] +
            a[9] * b[6] +
            a[10] * b[10] +
            a[11] * b[14];
  res[11] = a[8] * b[3] +
            a[9] * b[7] +
            a[10] * b[11] +
            a[11] * b[15];

  res[12] = a[12] * b[0] +
            a[13] * b[4] +
            a[14] * b[8] +
            a[15] * b[12];
  res[13] = a[12] * b[1] +
            a[13] * b[5] +
            a[14] * b[9] +
            a[15] * b[13];
  res[14] = a[12] * b[2] +
            a[13] * b[6] +
            a[14] * b[10] +
            a[15] * b[14];
  res[15] = a[12] * b[3] +
            a[13] * b[7] +
            a[14] * b[11] +
            a[15] * b[15];

  return res;
};

//snabbtjs.mat_to_css = function(matrix) {
//  var css = 'matrix3d(';
//  var MIN = 0.00000001;
//  for(var i=0;i<matrix.length-1;++i) {
//    if(matrix[i] < MIN)
//      css += '0,';
//    else
//      css += matrix[i].toFixed(10) + ",";
//  }
//  if(matrix[15] < MIN)
//    css += '0';
//  else
//    css += matrix[15].toFixed(10);
//  return css + ")";
//};

snabbtjs.mat_to_css = function(matrix) {
  var css = 'matrix3d(' +
            matrix[0].toFixed(10) + ', ' +
            matrix[1].toFixed(10) + ', ' +
            matrix[2].toFixed(10) + ', ' +
            matrix[3].toFixed(10) + ', ' +
            matrix[4].toFixed(10) + ', ' +
            matrix[5].toFixed(10) + ', ' +
            matrix[6].toFixed(10) + ', ' +
            matrix[7].toFixed(10) + ', ' +
            matrix[8].toFixed(10) + ', ' +
            matrix[9].toFixed(10) + ', ' +
            matrix[10].toFixed(10) + ', ' +
            matrix[11].toFixed(10) + ', ' +
            matrix[12].toFixed(10) + ', ' +
            matrix[13].toFixed(10) + ', ' +
            matrix[14].toFixed(10) + ', ' +
            matrix[15].toFixed(10) + ')';
  return css;
};

snabbtjs.mult = function(a, b) {
  var m = new Float32Array(16);
  snabbtjs.assigned_matrix_multiplication(a, b, m);
  return m;
};

snabbtjs.rotX = function(rad) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.assign_rotX = function(m, rad) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotY = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotY = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotZ = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotZ = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.trans = function(x, y, z) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.assign_trans = function(m, x, y, z) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.scale = function(x, y) {
  return new Float32Array([
     x, 0, 0, 0,
     0, y, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_scale = function(m, x, y) {
  m[0] = x; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = y; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.ident = function() {
  return new Float32Array([
     1, 0, 0, 0,
     0, 1, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_ident = function(m) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.set_css = function(el, state) {
  var matrix = state.as_matrix();
  if(el.hasOwnProperty('length')) {
    for(var i=0;i<el.length;++i) {
      el[i].style.webkitTransform = snabbtjs.mat_to_css(matrix);
      el[i].style.transform = snabbtjs.mat_to_css(matrix);
      if(state.width !== undefined)
        el[i].style.width = state.width + 'px';
      if(state.height !== undefined)
        el[i].style.height = state.height + 'px';
      if(state.opacity !== undefined)
        el[i].style.opacity = state.opacity;
    }
  } else {
    el.style.webkitTransform = snabbtjs.mat_to_css(matrix);
    el.style.transform = snabbtjs.mat_to_css(matrix);
    if(state.width !== undefined)
      el.style.width = state.width + 'px';
    if(state.height !== undefined)
      el.style.height = state.height + 'px';
    if(state.opacity !== undefined)
      el.style.opacity = state.opacity;
  }
};

;snabbtjs.State = function(config) {
  this.ax = config.ax || 0;
  this.ay = config.ay || 0;
  this.az = config.az || 0;
  this.x = config.x || 0;
  this.y = config.y || 0;
  this.z = config.z || 0;
  this.bx = config.bx || 0;
  this.by = config.by || 0;
  this.bz = config.bz || 0;
  this.offset_x = config.offset_x || 0;
  this.offset_y = config.offset_y || 0;
  this.offset_z = config.offset_z || 0;
  this.sx = config.sx || 1;
  this.sy = config.sy || 1;
  this.width = config.width;
  this.height = config.height;
  this.opacity = config.opacity;
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
    sx: this.sx,
    sy: this.sy,
    height: this.height,
    width: this.width,
    opacity: this.opacity
  });
  return p;
};

snabbtjs.State.prototype.assign = function(p) {
  this.ax = p.ax;
  this.ay = p.ay;
  this.az = p.az;
  this.x = p.x;
  this.y = p.y;
  this.z = p.z;
  this.bx = p.bx;
  this.by = p.by;
  this.bz = p.bz;
  this.sx = p.sx;
  this.sy = p.sy;
  this.opacity = p.opacity;
};

//  Reuse the same three matrices everytime.
var temp_m = snabbtjs.ident();
var temp_res1 = snabbtjs.ident();
var temp_res2 = snabbtjs.ident();

snabbtjs.State.prototype.as_matrix = function() {
  // Scale
  snabbtjs.assign_scale(temp_res1, this.sx, this.sy);

  // Pre-rotation
  snabbtjs.assign_rotX(temp_res2, this.ax);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_res2, temp_m);

  snabbtjs.assign_rotY(temp_res1, this.ay);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_m, temp_res2);
  snabbtjs.assign_rotZ(temp_m, this.az);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res2, temp_res1);

  // Translation
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_trans(temp_m, this.x, this.y, this.z), temp_res2);

  // Post-rotation
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotX(temp_m, this.bx), temp_res1);
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_rotY(temp_m, this.by), temp_res2);
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotZ(temp_m, this.bz), temp_res1);

  // Final offset
  snabbtjs.assign_trans(temp_m, this.offset_x, this.offset_y, this.offset_z);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res1, temp_res2);
  return temp_res2;
};

;
queue_length = 100;
tick_requests = [];
tick_start = 0;
tick_end = 0;


function requestAnimFrame(func) {
  tick_requests.push(func);
  //tick_requests[tick_end] = func;
  //tick_end = (tick_end + 1) % queue_length;
}

function master_tick(time) {
  //if(tick_start != tick_end) {
  //  var curr_end = tick_end;
  //  for(var i=tick_start;i<curr_end + queue_length; ++i) {
  //    var real_i = i % tick_requests.length;
  //    tick_requests[real_i](time);
  //  }
  //  tick_start = curr_end;
  //}
  var len = tick_requests.length;
  for(var i=0;i<len;++i) {
    tick_requests[i](time);
  }
  tick_requests.splice(0, len);
  window.requestAnimationFrame(master_tick);
}

window.requestAnimationFrame(master_tick);

function state_from_options(p, options, prefix) {

  if(options[prefix + 'pos']) {
    p.x = options[prefix + 'pos'][0];
    p.y = options[prefix + 'pos'][1];
    p.z = options[prefix + 'pos'][2];
  }
  if(options[prefix + 'rot']) {
    p.ax =  options[prefix + 'rot'][0];
    p.ay =  options[prefix + 'rot'][1];
    p.az =  options[prefix + 'rot'][2];
  }
  if(options[prefix + 'rot_post']) {
    p.bx =  options[prefix + 'rot_post'][0];
    p.by =  options[prefix + 'rot_post'][1];
    p.bz =  options[prefix + 'rot_post'][2];
  }
  if(options[prefix + 'scale']) {
    p.sx =  options[prefix + 'scale'][0];
    p.sy =  options[prefix + 'scale'][1];
  }
  if(options[prefix + 'width'] !== undefined) {
    p.width =  options[prefix + 'width'];
  }
  if(options[prefix + 'height'] !== undefined) {
    p.height =  options[prefix + 'height'];
  }
  if(options[prefix + 'opacity'] !== undefined) {
    p.opacity =  options[prefix + 'opacity'];
  }
  return p;
}


function snabbt(arg1, arg2, arg3) {
  if(arg1 == 'scroll')
    return snabbtjs.setup_scroll_animation(arg2);
  if(arg1 == 'attention')
    return snabbtjs.setup_attention_animation(arg2, arg3);
  var e = arg1;
  var options = arg2;


  var start = new snabbtjs.State({});
  start = state_from_options(start, options, 'from_');
  var end = new snabbtjs.State({});
  end = state_from_options(end, options, '');

  var anim_options = {
    start_state: start,
    end_state: end,
    duration: options.duration || 1000,
    delay: options.delay || 0,
    offset: options.offset
  };
  if(options.easing)
    anim_options.easing = snabbtjs.EASING_FUNCS[options.easing];
  if(options.manual)
    anim_options.mode = snabbtjs.AnimationType.MANUAL;
  var animation = new snabbtjs.Animation(anim_options);

  var queue = [];
  var chainer = {
    then: function(opts) {
      queue.unshift(opts);
      return chainer;
    }
  };

  function tick(time) {
    animation.tick(time);
    var current_state = animation.current_state();
    snabbtjs.set_css(e, current_state);

    if(animation.completed()) {
      var end_state = animation.end_state();
      snabbtjs.set_css(e, end_state);

      if(options.loop > 1) {
        options.loop -= 1;
        animation.assign(anim_options);
        requestAnimFrame(tick);
      } else {
        if(options.callback) {
          options.callback();
        }
        if(queue.length) {
          options = queue.pop();

          start = state_from_options(end, options, 'from_');
          end = state_from_options(new snabbtjs.State({}), options, '');
          animation.assign({
            start_state: start,
            end_state: end,
            duration: options.duration || 1000,
            delay: options.delay || 0,
            offset: options.offset
          });
          if(options.easing)
            animation.easing = snabbtjs.EASING_FUNCS[options.easing];

          animation.tick(time);
          requestAnimFrame(tick);
        }
      }
    } else {
      requestAnimFrame(tick);
    }
  }
  var start_state = animation.start_state();
  snabbtjs.set_css(e, start_state);

  requestAnimFrame(tick);
  if(options.manual) 
    return animation;
  else
    return chainer;
}

snabbtjs.setup_scroll_animation = function(options) {
  var animation = new snabbtjs.ScrollAnimation(options);

  function tick(time) {
    animation.tick(time);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  }
  requestAnimFrame(tick);
};

snabbtjs.setup_attention_animation = function(e,  options) {

  var movement = state_from_options(new snabbtjs.State({}), options, '');
  var animation = new snabbtjs.AttentionAnimation({
    movement: movement,
    stiffness: options.stiffness,
    deacceleration: options.deacceleration
  });
  function tick(time) {
    animation.tick(time);
    var current_state = animation.current_state();
    snabbtjs.set_css(e, current_state);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  }
  requestAnimFrame(tick);
};
;var snabbtjs = snabbtjs || {};

snabbtjs.assigned_matrix_multiplication = function(a, b, res) {
  // Unrolled loop
  res[0] = a[0] * b[0] +
           a[1] * b[4] +
           a[2] * b[8] +
           a[3] * b[12];
  res[1] = a[0] * b[1] +
           a[1] * b[5] +
           a[2] * b[9] +
           a[3] * b[13];
  res[2] = a[0] * b[2] +
           a[1] * b[6] +
           a[2] * b[10] +
           a[3] * b[14];
  res[3] = a[0] * b[3] +
           a[1] * b[7] +
           a[2] * b[11] +
           a[3] * b[15];

  res[4] = a[4] * b[0] +
           a[5] * b[4] +
           a[6] * b[8] +
           a[7] * b[12];
  res[5] = a[4] * b[1] +
           a[5] * b[5] +
           a[6] * b[9] +
           a[7] * b[13];
  res[6] = a[4] * b[2] +
           a[5] * b[6] +
           a[6] * b[10] +
           a[7] * b[14];
  res[7] = a[4] * b[3] +
           a[5] * b[7] +
           a[6] * b[11] +
           a[7] * b[15];

  res[8] = a[8] * b[0] +
           a[9] * b[4] +
           a[10] * b[8] +
           a[11] * b[12];
  res[9] = a[8] * b[1] +
           a[9] * b[5] +
           a[10] * b[9] +
           a[11] * b[13];
  res[10] = a[8] * b[2] +
            a[9] * b[6] +
            a[10] * b[10] +
            a[11] * b[14];
  res[11] = a[8] * b[3] +
            a[9] * b[7] +
            a[10] * b[11] +
            a[11] * b[15];

  res[12] = a[12] * b[0] +
            a[13] * b[4] +
            a[14] * b[8] +
            a[15] * b[12];
  res[13] = a[12] * b[1] +
            a[13] * b[5] +
            a[14] * b[9] +
            a[15] * b[13];
  res[14] = a[12] * b[2] +
            a[13] * b[6] +
            a[14] * b[10] +
            a[15] * b[14];
  res[15] = a[12] * b[3] +
            a[13] * b[7] +
            a[14] * b[11] +
            a[15] * b[15];

  return res;
};

//snabbtjs.mat_to_css = function(matrix) {
//  var css = 'matrix3d(';
//  var MIN = 0.00000001;
//  for(var i=0;i<matrix.length-1;++i) {
//    if(matrix[i] < MIN)
//      css += '0,';
//    else
//      css += matrix[i].toFixed(10) + ",";
//  }
//  if(matrix[15] < MIN)
//    css += '0';
//  else
//    css += matrix[15].toFixed(10);
//  return css + ")";
//};

snabbtjs.mat_to_css = function(matrix) {
  var css = 'matrix3d(' +
            matrix[0].toFixed(10) + ', ' +
            matrix[1].toFixed(10) + ', ' +
            matrix[2].toFixed(10) + ', ' +
            matrix[3].toFixed(10) + ', ' +
            matrix[4].toFixed(10) + ', ' +
            matrix[5].toFixed(10) + ', ' +
            matrix[6].toFixed(10) + ', ' +
            matrix[7].toFixed(10) + ', ' +
            matrix[8].toFixed(10) + ', ' +
            matrix[9].toFixed(10) + ', ' +
            matrix[10].toFixed(10) + ', ' +
            matrix[11].toFixed(10) + ', ' +
            matrix[12].toFixed(10) + ', ' +
            matrix[13].toFixed(10) + ', ' +
            matrix[14].toFixed(10) + ', ' +
            matrix[15].toFixed(10) + ')';
  return css;
};

snabbtjs.mult = function(a, b) {
  var m = new Float32Array(16);
  snabbtjs.assigned_matrix_multiplication(a, b, m);
  return m;
};

snabbtjs.rotX = function(rad) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.assign_rotX = function(m, rad) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotY = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotY = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotZ = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotZ = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.trans = function(x, y, z) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.assign_trans = function(m, x, y, z) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.scale = function(x, y) {
  return new Float32Array([
     x, 0, 0, 0,
     0, y, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_scale = function(m, x, y) {
  m[0] = x; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = y; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.ident = function() {
  return new Float32Array([
     1, 0, 0, 0,
     0, 1, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_ident = function(m) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.set_css = function(el, state) {
  var matrix = state.as_matrix();
  if(el.hasOwnProperty('length')) {
    for(var i=0;i<el.length;++i) {
      el[i].style.webkitTransform = snabbtjs.mat_to_css(matrix);
      el[i].style.transform = snabbtjs.mat_to_css(matrix);
      if(state.width !== undefined)
        el[i].style.width = state.width + 'px';
      if(state.height !== undefined)
        el[i].style.height = state.height + 'px';
      if(state.opacity !== undefined)
        el[i].style.opacity = state.opacity;
    }
  } else {
    el.style.webkitTransform = snabbtjs.mat_to_css(matrix);
    el.style.transform = snabbtjs.mat_to_css(matrix);
    if(state.width !== undefined)
      el.style.width = state.width + 'px';
    if(state.height !== undefined)
      el.style.height = state.height + 'px';
    if(state.opacity !== undefined)
      el.style.opacity = state.opacity;
  }
};

;snabbtjs.State = function(config) {
  this.ax = config.ax || 0;
  this.ay = config.ay || 0;
  this.az = config.az || 0;
  this.x = config.x || 0;
  this.y = config.y || 0;
  this.z = config.z || 0;
  this.bx = config.bx || 0;
  this.by = config.by || 0;
  this.bz = config.bz || 0;
  this.offset_x = config.offset_x || 0;
  this.offset_y = config.offset_y || 0;
  this.offset_z = config.offset_z || 0;
  this.sx = config.sx || 1;
  this.sy = config.sy || 1;
  this.width = config.width;
  this.height = config.height;
  this.opacity = config.opacity;
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
    sx: this.sx,
    sy: this.sy,
    height: this.height,
    width: this.width,
    opacity: this.opacity
  });
  return p;
};

snabbtjs.State.prototype.assign = function(p) {
  this.ax = p.ax;
  this.ay = p.ay;
  this.az = p.az;
  this.x = p.x;
  this.y = p.y;
  this.z = p.z;
  this.bx = p.bx;
  this.by = p.by;
  this.bz = p.bz;
  this.sx = p.sx;
  this.sy = p.sy;
  this.opacity = p.opacity;
};

//  Reuse the same three matrices everytime.
var temp_m = snabbtjs.ident();
var temp_res1 = snabbtjs.ident();
var temp_res2 = snabbtjs.ident();

snabbtjs.State.prototype.as_matrix = function() {
  // Scale
  snabbtjs.assign_scale(temp_res1, this.sx, this.sy);

  // Pre-rotation
  snabbtjs.assign_rotX(temp_res2, this.ax);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_res2, temp_m);

  snabbtjs.assign_rotY(temp_res1, this.ay);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_m, temp_res2);
  snabbtjs.assign_rotZ(temp_m, this.az);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res2, temp_res1);

  // Translation
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_trans(temp_m, this.x, this.y, this.z), temp_res2);

  // Post-rotation
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotX(temp_m, this.bx), temp_res1);
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_rotY(temp_m, this.by), temp_res2);
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotZ(temp_m, this.bz), temp_res1);

  // Final offset
  snabbtjs.assign_trans(temp_m, this.offset_x, this.offset_y, this.offset_z);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res1, temp_res2);
  return temp_res2;
};

;
queue_length = 100;
tick_requests = [];
tick_start = 0;
tick_end = 0;


function requestAnimFrame(func) {
  tick_requests.push(func);
  //tick_requests[tick_end] = func;
  //tick_end = (tick_end + 1) % queue_length;
}

function master_tick(time) {
  //if(tick_start != tick_end) {
  //  var curr_end = tick_end;
  //  for(var i=tick_start;i<curr_end + queue_length; ++i) {
  //    var real_i = i % tick_requests.length;
  //    tick_requests[real_i](time);
  //  }
  //  tick_start = curr_end;
  //}
  var len = tick_requests.length;
  for(var i=0;i<len;++i) {
    tick_requests[i](time);
  }
  tick_requests.splice(0, len);
  window.requestAnimationFrame(master_tick);
}

window.requestAnimationFrame(master_tick);

function state_from_options(p, options, prefix) {

  if(options[prefix + 'pos']) {
    p.x = options[prefix + 'pos'][0];
    p.y = options[prefix + 'pos'][1];
    p.z = options[prefix + 'pos'][2];
  }
  if(options[prefix + 'rot']) {
    p.ax =  options[prefix + 'rot'][0];
    p.ay =  options[prefix + 'rot'][1];
    p.az =  options[prefix + 'rot'][2];
  }
  if(options[prefix + 'rot_post']) {
    p.bx =  options[prefix + 'rot_post'][0];
    p.by =  options[prefix + 'rot_post'][1];
    p.bz =  options[prefix + 'rot_post'][2];
  }
  if(options[prefix + 'scale']) {
    p.sx =  options[prefix + 'scale'][0];
    p.sy =  options[prefix + 'scale'][1];
  }
  if(options[prefix + 'width'] !== undefined) {
    p.width =  options[prefix + 'width'];
  }
  if(options[prefix + 'height'] !== undefined) {
    p.height =  options[prefix + 'height'];
  }
  if(options[prefix + 'opacity'] !== undefined) {
    p.opacity =  options[prefix + 'opacity'];
  }
  return p;
}


function snabbt(arg1, arg2, arg3) {
  if(arg1 == 'scroll')
    return snabbtjs.setup_scroll_animation(arg2);
  if(arg1 == 'attention')
    return snabbtjs.setup_attention_animation(arg2, arg3);
  var e = arg1;
  var options = arg2;


  var start = new snabbtjs.State({});
  start = state_from_options(start, options, 'from_');
  var end = new snabbtjs.State({});
  end = state_from_options(end, options, '');

  var anim_options = {
    start_state: start,
    end_state: end,
    duration: options.duration || 1000,
    delay: options.delay || 0,
    offset: options.offset
  };
  if(options.easing)
    anim_options.easing = snabbtjs.EASING_FUNCS[options.easing];
  if(options.manual)
    anim_options.mode = snabbtjs.AnimationType.MANUAL;
  var animation = new snabbtjs.Animation(anim_options);

  var queue = [];
  var chainer = {
    then: function(opts) {
      queue.unshift(opts);
      return chainer;
    }
  };

  function tick(time) {
    animation.tick(time);
    var current_state = animation.current_state();
    snabbtjs.set_css(e, current_state);

    if(animation.completed()) {
      var end_state = animation.end_state();
      snabbtjs.set_css(e, end_state);

      if(options.loop > 1) {
        options.loop -= 1;
        animation.assign(anim_options);
        requestAnimFrame(tick);
      } else {
        if(options.callback) {
          options.callback();
        }
        if(queue.length) {
          options = queue.pop();

          start = state_from_options(end, options, 'from_');
          end = state_from_options(new snabbtjs.State({}), options, '');
          animation.assign({
            start_state: start,
            end_state: end,
            duration: options.duration || 1000,
            delay: options.delay || 0,
            offset: options.offset
          });
          if(options.easing)
            animation.easing = snabbtjs.EASING_FUNCS[options.easing];

          animation.tick(time);
          requestAnimFrame(tick);
        }
      }
    } else {
      requestAnimFrame(tick);
    }
  }
  var start_state = animation.start_state();
  snabbtjs.set_css(e, start_state);

  requestAnimFrame(tick);
  if(options.manual) 
    return animation;
  else
    return chainer;
}

snabbtjs.setup_scroll_animation = function(options) {
  var animation = new snabbtjs.ScrollAnimation(options);

  function tick(time) {
    animation.tick(time);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  }
  requestAnimFrame(tick);
};

snabbtjs.setup_attention_animation = function(e,  options) {

  var movement = state_from_options(new snabbtjs.State({}), options, '');
  var animation = new snabbtjs.AttentionAnimation({
    movement: movement,
    stiffness: options.stiffness,
    deacceleration: options.deacceleration,
    initial_velocity: options.initial_velocity
  });
  function tick(time) {
    animation.tick(time);
    var current_state = animation.current_state();
    snabbtjs.set_css(e, current_state);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  }
  requestAnimFrame(tick);
};
;var snabbtjs = snabbtjs || {};

snabbtjs.assigned_matrix_multiplication = function(a, b, res) {
  // Unrolled loop
  res[0] = a[0] * b[0] +
           a[1] * b[4] +
           a[2] * b[8] +
           a[3] * b[12];
  res[1] = a[0] * b[1] +
           a[1] * b[5] +
           a[2] * b[9] +
           a[3] * b[13];
  res[2] = a[0] * b[2] +
           a[1] * b[6] +
           a[2] * b[10] +
           a[3] * b[14];
  res[3] = a[0] * b[3] +
           a[1] * b[7] +
           a[2] * b[11] +
           a[3] * b[15];

  res[4] = a[4] * b[0] +
           a[5] * b[4] +
           a[6] * b[8] +
           a[7] * b[12];
  res[5] = a[4] * b[1] +
           a[5] * b[5] +
           a[6] * b[9] +
           a[7] * b[13];
  res[6] = a[4] * b[2] +
           a[5] * b[6] +
           a[6] * b[10] +
           a[7] * b[14];
  res[7] = a[4] * b[3] +
           a[5] * b[7] +
           a[6] * b[11] +
           a[7] * b[15];

  res[8] = a[8] * b[0] +
           a[9] * b[4] +
           a[10] * b[8] +
           a[11] * b[12];
  res[9] = a[8] * b[1] +
           a[9] * b[5] +
           a[10] * b[9] +
           a[11] * b[13];
  res[10] = a[8] * b[2] +
            a[9] * b[6] +
            a[10] * b[10] +
            a[11] * b[14];
  res[11] = a[8] * b[3] +
            a[9] * b[7] +
            a[10] * b[11] +
            a[11] * b[15];

  res[12] = a[12] * b[0] +
            a[13] * b[4] +
            a[14] * b[8] +
            a[15] * b[12];
  res[13] = a[12] * b[1] +
            a[13] * b[5] +
            a[14] * b[9] +
            a[15] * b[13];
  res[14] = a[12] * b[2] +
            a[13] * b[6] +
            a[14] * b[10] +
            a[15] * b[14];
  res[15] = a[12] * b[3] +
            a[13] * b[7] +
            a[14] * b[11] +
            a[15] * b[15];

  return res;
};

//snabbtjs.mat_to_css = function(matrix) {
//  var css = 'matrix3d(';
//  var MIN = 0.00000001;
//  for(var i=0;i<matrix.length-1;++i) {
//    if(matrix[i] < MIN)
//      css += '0,';
//    else
//      css += matrix[i].toFixed(10) + ",";
//  }
//  if(matrix[15] < MIN)
//    css += '0';
//  else
//    css += matrix[15].toFixed(10);
//  return css + ")";
//};

snabbtjs.mat_to_css = function(matrix) {
  var css = 'matrix3d(' +
            matrix[0].toFixed(10) + ', ' +
            matrix[1].toFixed(10) + ', ' +
            matrix[2].toFixed(10) + ', ' +
            matrix[3].toFixed(10) + ', ' +
            matrix[4].toFixed(10) + ', ' +
            matrix[5].toFixed(10) + ', ' +
            matrix[6].toFixed(10) + ', ' +
            matrix[7].toFixed(10) + ', ' +
            matrix[8].toFixed(10) + ', ' +
            matrix[9].toFixed(10) + ', ' +
            matrix[10].toFixed(10) + ', ' +
            matrix[11].toFixed(10) + ', ' +
            matrix[12].toFixed(10) + ', ' +
            matrix[13].toFixed(10) + ', ' +
            matrix[14].toFixed(10) + ', ' +
            matrix[15].toFixed(10) + ')';
  return css;
};

snabbtjs.mult = function(a, b) {
  var m = new Float32Array(16);
  snabbtjs.assigned_matrix_multiplication(a, b, m);
  return m;
};

snabbtjs.rotX = function(rad) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.assign_rotX = function(m, rad) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotY = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotY = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotZ = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotZ = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.trans = function(x, y, z) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.assign_trans = function(m, x, y, z) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.scale = function(x, y) {
  return new Float32Array([
     x, 0, 0, 0,
     0, y, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_scale = function(m, x, y) {
  m[0] = x; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = y; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.ident = function() {
  return new Float32Array([
     1, 0, 0, 0,
     0, 1, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_ident = function(m) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.set_css = function(el, state) {
  var matrix = state.as_matrix();
  if(el.hasOwnProperty('length')) {
    for(var i=0;i<el.length;++i) {
      el[i].style.webkitTransform = snabbtjs.mat_to_css(matrix);
      el[i].style.transform = snabbtjs.mat_to_css(matrix);
      if(state.width !== undefined)
        el[i].style.width = state.width + 'px';
      if(state.height !== undefined)
        el[i].style.height = state.height + 'px';
      if(state.opacity !== undefined)
        el[i].style.opacity = state.opacity;
    }
  } else {
    el.style.webkitTransform = snabbtjs.mat_to_css(matrix);
    el.style.transform = snabbtjs.mat_to_css(matrix);
    if(state.width !== undefined)
      el.style.width = state.width + 'px';
    if(state.height !== undefined)
      el.style.height = state.height + 'px';
    if(state.opacity !== undefined)
      el.style.opacity = state.opacity;
  }
};

;snabbtjs.State = function(config) {
  this.ax = config.ax || 0;
  this.ay = config.ay || 0;
  this.az = config.az || 0;
  this.x = config.x || 0;
  this.y = config.y || 0;
  this.z = config.z || 0;
  this.bx = config.bx || 0;
  this.by = config.by || 0;
  this.bz = config.bz || 0;
  this.offset_x = config.offset_x || 0;
  this.offset_y = config.offset_y || 0;
  this.offset_z = config.offset_z || 0;
  this.sx = config.sx || 1;
  this.sy = config.sy || 1;
  this.width = config.width;
  this.height = config.height;
  this.opacity = config.opacity;
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
    sx: this.sx,
    sy: this.sy,
    height: this.height,
    width: this.width,
    opacity: this.opacity
  });
  return p;
};

snabbtjs.State.prototype.assign = function(p) {
  this.ax = p.ax;
  this.ay = p.ay;
  this.az = p.az;
  this.x = p.x;
  this.y = p.y;
  this.z = p.z;
  this.bx = p.bx;
  this.by = p.by;
  this.bz = p.bz;
  this.sx = p.sx;
  this.sy = p.sy;
  this.opacity = p.opacity;
};

//  Reuse the same three matrices everytime.
var temp_m = snabbtjs.ident();
var temp_res1 = snabbtjs.ident();
var temp_res2 = snabbtjs.ident();

snabbtjs.State.prototype.as_matrix = function() {
  // Scale
  snabbtjs.assign_scale(temp_res1, this.sx, this.sy);

  // Pre-rotation
  snabbtjs.assign_rotX(temp_res2, this.ax);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_res2, temp_m);

  snabbtjs.assign_rotY(temp_res1, this.ay);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_m, temp_res2);
  snabbtjs.assign_rotZ(temp_m, this.az);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res2, temp_res1);

  // Translation
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_trans(temp_m, this.x, this.y, this.z), temp_res2);

  // Post-rotation
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotX(temp_m, this.bx), temp_res1);
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_rotY(temp_m, this.by), temp_res2);
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotZ(temp_m, this.bz), temp_res1);

  // Final offset
  snabbtjs.assign_trans(temp_m, this.offset_x, this.offset_y, this.offset_z);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res1, temp_res2);
  return temp_res2;
};

;
queue_length = 100;
tick_requests = [];
tick_start = 0;
tick_end = 0;


function requestAnimFrame(func) {
  tick_requests.push(func);
  //tick_requests[tick_end] = func;
  //tick_end = (tick_end + 1) % queue_length;
}

function master_tick(time) {
  //if(tick_start != tick_end) {
  //  var curr_end = tick_end;
  //  for(var i=tick_start;i<curr_end + queue_length; ++i) {
  //    var real_i = i % tick_requests.length;
  //    tick_requests[real_i](time);
  //  }
  //  tick_start = curr_end;
  //}
  var len = tick_requests.length;
  for(var i=0;i<len;++i) {
    tick_requests[i](time);
  }
  tick_requests.splice(0, len);
  window.requestAnimationFrame(master_tick);
}

window.requestAnimationFrame(master_tick);

function state_from_options(p, options, prefix) {

  if(options[prefix + 'pos']) {
    p.x = options[prefix + 'pos'][0];
    p.y = options[prefix + 'pos'][1];
    p.z = options[prefix + 'pos'][2];
  }
  if(options[prefix + 'rot']) {
    p.ax =  options[prefix + 'rot'][0];
    p.ay =  options[prefix + 'rot'][1];
    p.az =  options[prefix + 'rot'][2];
  }
  if(options[prefix + 'rot_post']) {
    p.bx =  options[prefix + 'rot_post'][0];
    p.by =  options[prefix + 'rot_post'][1];
    p.bz =  options[prefix + 'rot_post'][2];
  }
  if(options[prefix + 'scale']) {
    p.sx =  options[prefix + 'scale'][0];
    p.sy =  options[prefix + 'scale'][1];
  }
  if(options[prefix + 'width'] !== undefined) {
    p.width =  options[prefix + 'width'];
  }
  if(options[prefix + 'height'] !== undefined) {
    p.height =  options[prefix + 'height'];
  }
  if(options[prefix + 'opacity'] !== undefined) {
    p.opacity =  options[prefix + 'opacity'];
  }
  return p;
}


function snabbt(arg1, arg2, arg3) {
  if(arg1 == 'scroll')
    return snabbtjs.setup_scroll_animation(arg2);
  if(arg1 == 'attention')
    return snabbtjs.setup_attention_animation(arg2, arg3);
  var e = arg1;
  var options = arg2;


  var start = new snabbtjs.State({});
  start = state_from_options(start, options, 'from_');
  var end = new snabbtjs.State({});
  end = state_from_options(end, options, '');

  var anim_options = {
    start_state: start,
    end_state: end,
    duration: options.duration || 1000,
    delay: options.delay || 0,
    offset: options.offset
  };

  if(options.easing == 'spring') {
    anim_options.mode = snabbtjs.AnimationType.SPRING;
    anim_options.spring_constant = options.spring_constant;
    anim_options.deacceleration = options.deacceleration;
    anim_options.initial_velocity = options.initial_velocity;
  } else if(options.easing) {
    anim_options.easing = snabbtjs.EASING_FUNCS[options.easing];
  }

  if(options.manual)
    anim_options.mode = snabbtjs.AnimationType.MANUAL;
  var animation = new snabbtjs.Animation(anim_options);

  var queue = [];
  var chainer = {
    then: function(opts) {
      queue.unshift(opts);
      return chainer;
    }
  };

  function tick(time) {
    animation.tick(time);
    var current_state = animation.current_state();
    snabbtjs.set_css(e, current_state);

    if(animation.completed()) {
      var end_state = animation.end_state();
      snabbtjs.set_css(e, end_state);

      if(options.loop > 1) {
        options.loop -= 1;
        animation.assign(anim_options);
        requestAnimFrame(tick);
      } else {
        if(options.callback) {
          options.callback();
        }
        if(queue.length) {
          options = queue.pop();

          start = state_from_options(end, options, 'from_');
          end = state_from_options(new snabbtjs.State({}), options, '');
          animation.assign({
            start_state: start,
            end_state: end,
            duration: options.duration || 1000,
            delay: options.delay || 0,
            offset: options.offset
          });
          if(options.easing)
            animation.easing = snabbtjs.EASING_FUNCS[options.easing];

          animation.tick(time);
          requestAnimFrame(tick);
        }
      }
    } else {
      requestAnimFrame(tick);
    }
  }
  var start_state = animation.start_state();
  snabbtjs.set_css(e, start_state);

  requestAnimFrame(tick);
  if(options.manual) 
    return animation;
  else
    return chainer;
}

snabbtjs.setup_scroll_animation = function(options) {
  var animation = new snabbtjs.ScrollAnimation(options);

  function tick(time) {
    animation.tick(time);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  }
  requestAnimFrame(tick);
};

snabbtjs.setup_attention_animation = function(e,  options) {

  var movement = state_from_options(new snabbtjs.State({}), options, '');
  var animation = new snabbtjs.AttentionAnimation({
    movement: movement,
    spring_constant: options.spring_constant,
    deacceleration: options.deacceleration,
    initial_velocity: options.initial_velocity
  });
  function tick(time) {
    animation.tick(time);
    var current_state = animation.current_state();
    snabbtjs.set_css(e, current_state);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  }
  requestAnimFrame(tick);
};
;var snabbtjs = snabbtjs || {};

snabbtjs.assigned_matrix_multiplication = function(a, b, res) {
  // Unrolled loop
  res[0] = a[0] * b[0] +
           a[1] * b[4] +
           a[2] * b[8] +
           a[3] * b[12];
  res[1] = a[0] * b[1] +
           a[1] * b[5] +
           a[2] * b[9] +
           a[3] * b[13];
  res[2] = a[0] * b[2] +
           a[1] * b[6] +
           a[2] * b[10] +
           a[3] * b[14];
  res[3] = a[0] * b[3] +
           a[1] * b[7] +
           a[2] * b[11] +
           a[3] * b[15];

  res[4] = a[4] * b[0] +
           a[5] * b[4] +
           a[6] * b[8] +
           a[7] * b[12];
  res[5] = a[4] * b[1] +
           a[5] * b[5] +
           a[6] * b[9] +
           a[7] * b[13];
  res[6] = a[4] * b[2] +
           a[5] * b[6] +
           a[6] * b[10] +
           a[7] * b[14];
  res[7] = a[4] * b[3] +
           a[5] * b[7] +
           a[6] * b[11] +
           a[7] * b[15];

  res[8] = a[8] * b[0] +
           a[9] * b[4] +
           a[10] * b[8] +
           a[11] * b[12];
  res[9] = a[8] * b[1] +
           a[9] * b[5] +
           a[10] * b[9] +
           a[11] * b[13];
  res[10] = a[8] * b[2] +
            a[9] * b[6] +
            a[10] * b[10] +
            a[11] * b[14];
  res[11] = a[8] * b[3] +
            a[9] * b[7] +
            a[10] * b[11] +
            a[11] * b[15];

  res[12] = a[12] * b[0] +
            a[13] * b[4] +
            a[14] * b[8] +
            a[15] * b[12];
  res[13] = a[12] * b[1] +
            a[13] * b[5] +
            a[14] * b[9] +
            a[15] * b[13];
  res[14] = a[12] * b[2] +
            a[13] * b[6] +
            a[14] * b[10] +
            a[15] * b[14];
  res[15] = a[12] * b[3] +
            a[13] * b[7] +
            a[14] * b[11] +
            a[15] * b[15];

  return res;
};

//snabbtjs.mat_to_css = function(matrix) {
//  var css = 'matrix3d(';
//  var MIN = 0.00000001;
//  for(var i=0;i<matrix.length-1;++i) {
//    if(matrix[i] < MIN)
//      css += '0,';
//    else
//      css += matrix[i].toFixed(10) + ",";
//  }
//  if(matrix[15] < MIN)
//    css += '0';
//  else
//    css += matrix[15].toFixed(10);
//  return css + ")";
//};

snabbtjs.mat_to_css = function(matrix) {
  var css = 'matrix3d(' +
            matrix[0].toFixed(10) + ', ' +
            matrix[1].toFixed(10) + ', ' +
            matrix[2].toFixed(10) + ', ' +
            matrix[3].toFixed(10) + ', ' +
            matrix[4].toFixed(10) + ', ' +
            matrix[5].toFixed(10) + ', ' +
            matrix[6].toFixed(10) + ', ' +
            matrix[7].toFixed(10) + ', ' +
            matrix[8].toFixed(10) + ', ' +
            matrix[9].toFixed(10) + ', ' +
            matrix[10].toFixed(10) + ', ' +
            matrix[11].toFixed(10) + ', ' +
            matrix[12].toFixed(10) + ', ' +
            matrix[13].toFixed(10) + ', ' +
            matrix[14].toFixed(10) + ', ' +
            matrix[15].toFixed(10) + ')';
  return css;
};

snabbtjs.mult = function(a, b) {
  var m = new Float32Array(16);
  snabbtjs.assigned_matrix_multiplication(a, b, m);
  return m;
};

snabbtjs.rotX = function(rad) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.assign_rotX = function(m, rad) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotY = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotY = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotZ = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotZ = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.trans = function(x, y, z) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.assign_trans = function(m, x, y, z) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.scale = function(x, y) {
  return new Float32Array([
     x, 0, 0, 0,
     0, y, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_scale = function(m, x, y) {
  m[0] = x; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = y; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.ident = function() {
  return new Float32Array([
     1, 0, 0, 0,
     0, 1, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_ident = function(m) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.set_css = function(el, state) {
  var matrix = state.as_matrix();
  if(el.hasOwnProperty('length')) {
    for(var i=0;i<el.length;++i) {
      el[i].style.webkitTransform = snabbtjs.mat_to_css(matrix);
      el[i].style.transform = snabbtjs.mat_to_css(matrix);
      if(state.width !== undefined)
        el[i].style.width = state.width + 'px';
      if(state.height !== undefined)
        el[i].style.height = state.height + 'px';
      if(state.opacity !== undefined)
        el[i].style.opacity = state.opacity;
    }
  } else {
    el.style.webkitTransform = snabbtjs.mat_to_css(matrix);
    el.style.transform = snabbtjs.mat_to_css(matrix);
    if(state.width !== undefined)
      el.style.width = state.width + 'px';
    if(state.height !== undefined)
      el.style.height = state.height + 'px';
    if(state.opacity !== undefined)
      el.style.opacity = state.opacity;
  }
};

;snabbtjs.State = function(config) {
  this.ax = config.ax || 0;
  this.ay = config.ay || 0;
  this.az = config.az || 0;
  this.x = config.x || 0;
  this.y = config.y || 0;
  this.z = config.z || 0;
  this.bx = config.bx || 0;
  this.by = config.by || 0;
  this.bz = config.bz || 0;
  this.offset_x = config.offset_x || 0;
  this.offset_y = config.offset_y || 0;
  this.offset_z = config.offset_z || 0;
  this.sx = config.sx || 1;
  this.sy = config.sy || 1;
  this.width = config.width;
  this.height = config.height;
  this.opacity = config.opacity;
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
    sx: this.sx,
    sy: this.sy,
    height: this.height,
    width: this.width,
    opacity: this.opacity
  });
  return p;
};

snabbtjs.State.prototype.assign = function(p) {
  this.ax = p.ax;
  this.ay = p.ay;
  this.az = p.az;
  this.x = p.x;
  this.y = p.y;
  this.z = p.z;
  this.bx = p.bx;
  this.by = p.by;
  this.bz = p.bz;
  this.sx = p.sx;
  this.sy = p.sy;
  this.opacity = p.opacity;
};

//  Reuse the same three matrices everytime.
var temp_m = snabbtjs.ident();
var temp_res1 = snabbtjs.ident();
var temp_res2 = snabbtjs.ident();

snabbtjs.State.prototype.as_matrix = function() {
  // Scale
  snabbtjs.assign_scale(temp_res1, this.sx, this.sy);

  // Pre-rotation
  snabbtjs.assign_rotX(temp_res2, this.ax);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_res2, temp_m);

  snabbtjs.assign_rotY(temp_res1, this.ay);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_m, temp_res2);
  snabbtjs.assign_rotZ(temp_m, this.az);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res2, temp_res1);

  // Translation
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_trans(temp_m, this.x, this.y, this.z), temp_res2);

  // Post-rotation
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotX(temp_m, this.bx), temp_res1);
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_rotY(temp_m, this.by), temp_res2);
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotZ(temp_m, this.bz), temp_res1);

  // Final offset
  snabbtjs.assign_trans(temp_m, this.offset_x, this.offset_y, this.offset_z);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res1, temp_res2);
  return temp_res2;
};

;var snabbtjs = snabbtjs || {};

snabbtjs.option_or_default = function(option, def) {
  if(typeof option == 'undefined') {
    return def;
  }
  return option;
};
;
queue_length = 100;
tick_requests = [];
tick_start = 0;
tick_end = 0;


function requestAnimFrame(func) {
  tick_requests.push(func);
  //tick_requests[tick_end] = func;
  //tick_end = (tick_end + 1) % queue_length;
}

function master_tick(time) {
  //if(tick_start != tick_end) {
  //  var curr_end = tick_end;
  //  for(var i=tick_start;i<curr_end + queue_length; ++i) {
  //    var real_i = i % tick_requests.length;
  //    tick_requests[real_i](time);
  //  }
  //  tick_start = curr_end;
  //}
  var len = tick_requests.length;
  for(var i=0;i<len;++i) {
    tick_requests[i](time);
  }
  tick_requests.splice(0, len);
  window.requestAnimationFrame(master_tick);
}

window.requestAnimationFrame(master_tick);

function state_from_options(p, options, prefix) {

  if(options[prefix + 'pos']) {
    p.x = options[prefix + 'pos'][0];
    p.y = options[prefix + 'pos'][1];
    p.z = options[prefix + 'pos'][2];
  }
  if(options[prefix + 'rot']) {
    p.ax =  options[prefix + 'rot'][0];
    p.ay =  options[prefix + 'rot'][1];
    p.az =  options[prefix + 'rot'][2];
  }
  if(options[prefix + 'rot_post']) {
    p.bx =  options[prefix + 'rot_post'][0];
    p.by =  options[prefix + 'rot_post'][1];
    p.bz =  options[prefix + 'rot_post'][2];
  }
  if(options[prefix + 'scale']) {
    p.sx =  options[prefix + 'scale'][0];
    p.sy =  options[prefix + 'scale'][1];
  }
  if(options[prefix + 'width'] !== undefined) {
    p.width =  options[prefix + 'width'];
  }
  if(options[prefix + 'height'] !== undefined) {
    p.height =  options[prefix + 'height'];
  }
  if(options[prefix + 'opacity'] !== undefined) {
    p.opacity =  options[prefix + 'opacity'];
  }
  return p;
}


function snabbt(arg1, arg2, arg3) {
  if(arg1 == 'scroll')
    return snabbtjs.setup_scroll_animation(arg2);
  if(arg1 == 'attention')
    return snabbtjs.setup_attention_animation(arg2, arg3);
  var e = arg1;
  var options = arg2;


  var start = new snabbtjs.State({});
  start = state_from_options(start, options, 'from_');
  var end = new snabbtjs.State({});
  end = state_from_options(end, options, '');

  var anim_options = {
    start_state: start,
    end_state: end,
    duration: options.duration || 1000,
    delay: options.delay || 0,
    offset: options.offset
  };

  if(options.easing == 'spring') {
    anim_options.mode = snabbtjs.AnimationType.SPRING;
    anim_options.spring_constant = options.spring_constant;
    anim_options.deacceleration = options.deacceleration;
    anim_options.initial_velocity = options.initial_velocity;
  } else if(options.easing) {
    anim_options.easing = snabbtjs.EASING_FUNCS[options.easing];
  }

  if(options.manual)
    anim_options.mode = snabbtjs.AnimationType.MANUAL;
  var animation = new snabbtjs.Animation(anim_options);

  var queue = [];
  var chainer = {
    then: function(opts) {
      queue.unshift(opts);
      return chainer;
    }
  };

  function tick(time) {
    animation.tick(time);
    var current_state = animation.current_state();
    snabbtjs.set_css(e, current_state);

    if(animation.completed()) {
      var end_state = animation.end_state();
      snabbtjs.set_css(e, end_state);

      if(options.loop > 1) {
        options.loop -= 1;
        animation.assign(anim_options);
        requestAnimFrame(tick);
      } else {
        if(options.callback) {
          options.callback();
        }
        if(queue.length) {
          options = queue.pop();

          start = state_from_options(end, options, 'from_');
          end = state_from_options(new snabbtjs.State({}), options, '');
          animation.assign({
            start_state: start,
            end_state: end,
            duration: options.duration || 1000,
            delay: options.delay || 0,
            offset: options.offset
          });
          if(options.easing)
            animation.easing = snabbtjs.EASING_FUNCS[options.easing];

          animation.tick(time);
          requestAnimFrame(tick);
        }
      }
    } else {
      requestAnimFrame(tick);
    }
  }
  var start_state = animation.start_state();
  snabbtjs.set_css(e, start_state);

  requestAnimFrame(tick);
  if(options.manual) 
    return animation;
  else
    return chainer;
}

snabbtjs.setup_scroll_animation = function(options) {
  var animation = new snabbtjs.ScrollAnimation(options);

  function tick(time) {
    animation.tick(time);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  }
  requestAnimFrame(tick);
};

snabbtjs.setup_attention_animation = function(e,  options) {

  var movement = state_from_options(new snabbtjs.State({}), options, '');
  var animation = new snabbtjs.AttentionAnimation({
    movement: movement,
    spring_constant: options.spring_constant,
    deacceleration: options.deacceleration,
    initial_velocity: options.initial_velocity
  });
  function tick(time) {
    animation.tick(time);
    var current_state = animation.current_state();
    snabbtjs.set_css(e, current_state);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  }
  requestAnimFrame(tick);
};
;var snabbtjs = snabbtjs || {};

snabbtjs.assigned_matrix_multiplication = function(a, b, res) {
  // Unrolled loop
  res[0] = a[0] * b[0] +
           a[1] * b[4] +
           a[2] * b[8] +
           a[3] * b[12];
  res[1] = a[0] * b[1] +
           a[1] * b[5] +
           a[2] * b[9] +
           a[3] * b[13];
  res[2] = a[0] * b[2] +
           a[1] * b[6] +
           a[2] * b[10] +
           a[3] * b[14];
  res[3] = a[0] * b[3] +
           a[1] * b[7] +
           a[2] * b[11] +
           a[3] * b[15];

  res[4] = a[4] * b[0] +
           a[5] * b[4] +
           a[6] * b[8] +
           a[7] * b[12];
  res[5] = a[4] * b[1] +
           a[5] * b[5] +
           a[6] * b[9] +
           a[7] * b[13];
  res[6] = a[4] * b[2] +
           a[5] * b[6] +
           a[6] * b[10] +
           a[7] * b[14];
  res[7] = a[4] * b[3] +
           a[5] * b[7] +
           a[6] * b[11] +
           a[7] * b[15];

  res[8] = a[8] * b[0] +
           a[9] * b[4] +
           a[10] * b[8] +
           a[11] * b[12];
  res[9] = a[8] * b[1] +
           a[9] * b[5] +
           a[10] * b[9] +
           a[11] * b[13];
  res[10] = a[8] * b[2] +
            a[9] * b[6] +
            a[10] * b[10] +
            a[11] * b[14];
  res[11] = a[8] * b[3] +
            a[9] * b[7] +
            a[10] * b[11] +
            a[11] * b[15];

  res[12] = a[12] * b[0] +
            a[13] * b[4] +
            a[14] * b[8] +
            a[15] * b[12];
  res[13] = a[12] * b[1] +
            a[13] * b[5] +
            a[14] * b[9] +
            a[15] * b[13];
  res[14] = a[12] * b[2] +
            a[13] * b[6] +
            a[14] * b[10] +
            a[15] * b[14];
  res[15] = a[12] * b[3] +
            a[13] * b[7] +
            a[14] * b[11] +
            a[15] * b[15];

  return res;
};

//snabbtjs.mat_to_css = function(matrix) {
//  var css = 'matrix3d(';
//  var MIN = 0.00000001;
//  for(var i=0;i<matrix.length-1;++i) {
//    if(matrix[i] < MIN)
//      css += '0,';
//    else
//      css += matrix[i].toFixed(10) + ",";
//  }
//  if(matrix[15] < MIN)
//    css += '0';
//  else
//    css += matrix[15].toFixed(10);
//  return css + ")";
//};

snabbtjs.mat_to_css = function(matrix) {
  var css = 'matrix3d(' +
            matrix[0].toFixed(10) + ', ' +
            matrix[1].toFixed(10) + ', ' +
            matrix[2].toFixed(10) + ', ' +
            matrix[3].toFixed(10) + ', ' +
            matrix[4].toFixed(10) + ', ' +
            matrix[5].toFixed(10) + ', ' +
            matrix[6].toFixed(10) + ', ' +
            matrix[7].toFixed(10) + ', ' +
            matrix[8].toFixed(10) + ', ' +
            matrix[9].toFixed(10) + ', ' +
            matrix[10].toFixed(10) + ', ' +
            matrix[11].toFixed(10) + ', ' +
            matrix[12].toFixed(10) + ', ' +
            matrix[13].toFixed(10) + ', ' +
            matrix[14].toFixed(10) + ', ' +
            matrix[15].toFixed(10) + ')';
  return css;
};

snabbtjs.mult = function(a, b) {
  var m = new Float32Array(16);
  snabbtjs.assigned_matrix_multiplication(a, b, m);
  return m;
};

snabbtjs.rotX = function(rad) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.assign_rotX = function(m, rad) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotY = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotY = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotZ = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotZ = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.trans = function(x, y, z) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.assign_trans = function(m, x, y, z) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.scale = function(x, y) {
  return new Float32Array([
     x, 0, 0, 0,
     0, y, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_scale = function(m, x, y) {
  m[0] = x; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = y; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.ident = function() {
  return new Float32Array([
     1, 0, 0, 0,
     0, 1, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_ident = function(m) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.set_css = function(el, state) {
  var matrix = state.as_matrix();
  if(el.hasOwnProperty('length')) {
    for(var i=0;i<el.length;++i) {
      el[i].style.webkitTransform = snabbtjs.mat_to_css(matrix);
      el[i].style.transform = snabbtjs.mat_to_css(matrix);
      if(state.width !== undefined)
        el[i].style.width = state.width + 'px';
      if(state.height !== undefined)
        el[i].style.height = state.height + 'px';
      if(state.opacity !== undefined)
        el[i].style.opacity = state.opacity;
    }
  } else {
    el.style.webkitTransform = snabbtjs.mat_to_css(matrix);
    el.style.transform = snabbtjs.mat_to_css(matrix);
    if(state.width !== undefined)
      el.style.width = state.width + 'px';
    if(state.height !== undefined)
      el.style.height = state.height + 'px';
    if(state.opacity !== undefined)
      el.style.opacity = state.opacity;
  }
};

;snabbtjs.State = function(config) {
  this.ax = config.ax || 0;
  this.ay = config.ay || 0;
  this.az = config.az || 0;
  this.x = config.x || 0;
  this.y = config.y || 0;
  this.z = config.z || 0;
  this.bx = config.bx || 0;
  this.by = config.by || 0;
  this.bz = config.bz || 0;
  this.offset_x = config.offset_x || 0;
  this.offset_y = config.offset_y || 0;
  this.offset_z = config.offset_z || 0;
  this.sx = config.sx || 1;
  this.sy = config.sy || 1;
  this.width = config.width;
  this.height = config.height;
  this.opacity = config.opacity;
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
    sx: this.sx,
    sy: this.sy,
    height: this.height,
    width: this.width,
    opacity: this.opacity
  });
  return p;
};

snabbtjs.State.prototype.assign = function(p) {
  this.ax = p.ax;
  this.ay = p.ay;
  this.az = p.az;
  this.x = p.x;
  this.y = p.y;
  this.z = p.z;
  this.bx = p.bx;
  this.by = p.by;
  this.bz = p.bz;
  this.sx = p.sx;
  this.sy = p.sy;
  this.opacity = p.opacity;
};

//  Reuse the same three matrices everytime.
var temp_m = snabbtjs.ident();
var temp_res1 = snabbtjs.ident();
var temp_res2 = snabbtjs.ident();

snabbtjs.State.prototype.as_matrix = function() {
  // Scale
  snabbtjs.assign_scale(temp_res1, this.sx, this.sy);

  // Pre-rotation
  snabbtjs.assign_rotX(temp_res2, this.ax);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_res2, temp_m);

  snabbtjs.assign_rotY(temp_res1, this.ay);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_m, temp_res2);
  snabbtjs.assign_rotZ(temp_m, this.az);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res2, temp_res1);

  // Translation
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_trans(temp_m, this.x, this.y, this.z), temp_res2);

  // Post-rotation
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotX(temp_m, this.bx), temp_res1);
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_rotY(temp_m, this.by), temp_res2);
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotZ(temp_m, this.bz), temp_res1);

  // Final offset
  snabbtjs.assign_trans(temp_m, this.offset_x, this.offset_y, this.offset_z);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res1, temp_res2);
  return temp_res2;
};

;var snabbtjs = snabbtjs || {};

snabbtjs.option_or_default = function(option, def) {
  if(typeof option == 'undefined') {
    return def;
  }
  return option;
};
