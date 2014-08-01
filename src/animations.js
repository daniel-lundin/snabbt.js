var snabbtjs = snabbtjs || {};

snabbtjs.AnimationType = {};
snabbtjs.AnimationType.TIME = 1;
snabbtjs.AnimationType.MANUAL = 2;
snabbtjs.Animation = function(options) {
  this.assign(options);
};

snabbtjs.Animation.prototype.assign = function(options) {
  this.start_pos = options.start_pos || new snabbtjs.Position({});
  this.end_pos = options.end_pos || new snabbtjs.Position({});
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

  this.current_position = new snabbtjs.Position({});
  if(options.offset) {
    this.current_position.offset_x = this.offset[0];
    this.current_position.offset_y = this.offset[1];
    this.current_position.offset_z = this.offset[2];
    this.end_pos.offset_x = this.offset[0];
    this.end_pos.offset_y = this.offset[1];
    this.end_pos.offset_z = this.offset[2];
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
  // Start a TIME based animation from current position
  // to end_pos or start_pos depending on complete
  if(!complete) {
    this.end_pos.assign(this.start_pos);
  }
  this.start_pos.assign(this.current_position);
  this.mode = snabbtjs.AnimationType.TIME;
};

snabbtjs.Animation.prototype.set_value = function(value) {
  var delay = this.delay / this.duration;
  this.value = Math.max(0, Math.min(value - delay, 1));
};

snabbtjs.Animation.prototype.current_transform = function() {
  this.update_current_transition();
  return this.current_position;
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

snabbtjs.Animation.prototype.end_position = function() {
  if(this.mode == snabbtjs.AnimationType.TIME) {
    return this.end_pos;
  } else {
    return this.current_transform();
  }
};

snabbtjs.Animation.prototype.update_current_transition = function() {
  var curr = 0;
  var max = 0;
  if(this.mode == snabbtjs.AnimationType.TIME) {
    curr = Math.min(Math.max(0.001, this.current_time - this.start_time), this.duration);
    max = this.duration;
  }

  var dx = (this.end_pos.x - this.start_pos.x);
  var dy = (this.end_pos.y - this.start_pos.y);
  var dz = (this.end_pos.z - this.start_pos.z);
  var dax = (this.end_pos.ax - this.start_pos.ax);
  var day = (this.end_pos.ay - this.start_pos.ay);
  var daz = (this.end_pos.az - this.start_pos.az);
  var dbx = (this.end_pos.bx - this.start_pos.bx);
  var dby = (this.end_pos.by - this.start_pos.by);
  var dbz = (this.end_pos.bz - this.start_pos.bz);
  var dsx = (this.end_pos.sx - this.start_pos.sx);
  var dsy = (this.end_pos.sy - this.start_pos.sy);
  var dwidth = (this.end_pos.width - this.start_pos.width);
  var dheight = (this.end_pos.height - this.start_pos.height);

  var s = 0;
  if(this.mode == snabbtjs.AnimationType.TIME) {
    s = this.easing(curr, max);
  } else {
    s = this.value;
  }
  this.current_position.ax = this.start_pos.ax + s*dax;
  this.current_position.ay = this.start_pos.ay + s*day;
  this.current_position.az = this.start_pos.az + s*daz;
  this.current_position.x = this.start_pos.x + s*dx;
  this.current_position.y = this.start_pos.y + s*dy;
  this.current_position.z = this.start_pos.z + s*dz;
  this.current_position.bx = this.start_pos.bx + s*dbx;
  this.current_position.by = this.start_pos.by + s*dby;
  this.current_position.bz = this.start_pos.bz + s*dbz;
  this.current_position.sx = this.start_pos.sx + s*dsx;
  this.current_position.sy = this.start_pos.sy + s*dsy;
  if(this.end_pos.width)
    this.current_position.width = this.start_pos.width + s*dwidth;
  if(this.end_pos.height)
    this.current_position.height = this.start_pos.height + s*dheight;
};
