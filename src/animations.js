var snabbtjs = snabbtjs || {};

snabbtjs.Animation = function(options) {
  this.start_pos = options.start_pos || new snabbtjs.Position({});
  this.end_pos = options.end_pos || new snabbtjs.Position({});
  this.offset = options.offset;
  this.duration = options.duration || 500;
  this.delay = options.delay || 0;
  this.easing = options.easing || snabbtjs.linear_easing;
  this.transition = options.transition || snabbtjs.closest;

  this.start_time = 0;
  this.current_time = 0;
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
  var curr = Math.min(Math.max(0.001, this.current_time - this.start_time), this.duration);
  var max = this.duration;
  var q = curr/max;
  var t = this.transition(this.start_pos, this.end_pos, curr, max, this.easing);
  if(this.offset) {
    t.offset_x += this.offset[0];
    t.offset_y += this.offset[1];
    t.offset_z += this.offset[2];
  }
  return t;
};

snabbtjs.Animation.prototype.completed = function() {
  if(this.start_time === 0) {
    return false;
  }
  return this.current_time - this.start_time > this.duration;
};

snabbtjs.Animation.prototype.end_position = function() {
  //return this.current_transform();
  var end = this.end_pos;
  if(this.offset) {
    end.offset_x += this.offset[0];
    end.offset_y += this.offset[1];
    end.offset_z += this.offset[2];
  }
  return end;
};


// Transitions
snabbtjs.closest = function(start_pos, end_pos, step, steps, easing) {
  var x = (end_pos.x - start_pos.x);
  var y = (end_pos.y - start_pos.y);
  var z = (end_pos.z - start_pos.z);
  var ax = (end_pos.ax - start_pos.ax);
  var ay = (end_pos.ay - start_pos.ay);
  var az = (end_pos.az - start_pos.az);
  var bx = (end_pos.bx - start_pos.bx);
  var by = (end_pos.by - start_pos.by);
  var bz = (end_pos.bz - start_pos.bz);

  var s = this.easing(step, steps);
  var p = new snabbtjs.Position({
    ax: start_pos.ax + s*ax,
    ay: start_pos.ay + s*ay,
    az: start_pos.az + s*az,
    x: start_pos.x + s*x,
    y: start_pos.y + s*y,
    z: start_pos.z + s*z,
    bx: start_pos.bx + s*bx,
    by: start_pos.by + s*by,
    bz: start_pos.bz + s*bz,
  });
  return p;
};
