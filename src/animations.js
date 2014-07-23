var snabbtjs = snabbtjs || {};

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

  this.start_time = 0;
  this.current_time = 0;
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
  if(!this.start_time) {
    this.start_time = time;
  }
  if(time - this.start_time > this.delay)
    this.current_time = time - this.delay;
};

snabbtjs.Animation.prototype.current_transform = function() {
  this.update_current_transition();
  return this.current_position;
};

snabbtjs.Animation.prototype.completed = function() {
  if(this.start_time === 0) {
    return false;
  }
  return this.current_time - this.start_time > this.duration;
};

snabbtjs.Animation.prototype.end_position = function() {
  return this.end_pos;
};

snabbtjs.Animation.prototype.update_current_transition = function() {
  var curr = Math.min(Math.max(0.001, this.current_time - this.start_time), this.duration);
  var max = this.duration;

  var x = (this.end_pos.x - this.start_pos.x);
  var y = (this.end_pos.y - this.start_pos.y);
  var z = (this.end_pos.z - this.start_pos.z);
  var ax = (this.end_pos.ax - this.start_pos.ax);
  var ay = (this.end_pos.ay - this.start_pos.ay);
  var az = (this.end_pos.az - this.start_pos.az);
  var bx = (this.end_pos.bx - this.start_pos.bx);
  var by = (this.end_pos.by - this.start_pos.by);
  var bz = (this.end_pos.bz - this.start_pos.bz);
  var sx = (this.end_pos.sx - this.start_pos.sx);
  var sy = (this.end_pos.sy - this.start_pos.sy);


  var s = this.easing(curr, max);
  this.current_position.ax = this.start_pos.ax + s*ax;
  this.current_position.ay = this.start_pos.ay + s*ay;
  this.current_position.az = this.start_pos.az + s*az;
  this.current_position.x = this.start_pos.x + s*x;
  this.current_position.y = this.start_pos.y + s*y;
  this.current_position.z = this.start_pos.z + s*z;
  this.current_position.bx = this.start_pos.bx + s*bx;
  this.current_position.by = this.start_pos.by + s*by;
  this.current_position.bz = this.start_pos.bz + s*bz;
  this.current_position.sx = this.start_pos.sx + s*sx;
  this.current_position.sy = this.start_pos.sy + s*sy;
};
