
function Animation(options) {
  this.start_pos = options.start_pos || new Position({});
  this.end_pos = options.end_pos || new Position({});
  this.duration = options.duration || 500;
  this.easing = options.easing || linear_easing;
  this.transition = options.transition || closest;

  this.start_time = 0;
  this.current_time = 0;
}

Animation.prototype.tick = function(time) {
  // If first tick, set start_time
  if(!this.start_time) {
    this.start_time = time;
  }
  this.current_time = time;
};

Animation.prototype.current_transform = function() {
  var curr = Math.min(Math.max(0.001, this.current_time - this.start_time), this.duration);
  var max = this.duration;
  var q = curr/max;
  return this.transition(this.start_pos, this.end_pos, curr, max, this.easing);
};

Animation.prototype.completed = function() {
  if(this.start_time === 0) {
    return false;
  }
  return this.current_time - this.start_time > this.duration;
  //return this.step >= this.steps;
};

Animation.prototype.end_position = function() {
  //return this.current_transform();
  return this.end_pos;
};


// Transitions
function closest(start_pos, end_pos, step, steps, easing) {
  var x = (end_pos.x - start_pos.x);
  var y = (end_pos.y - start_pos.y);
  var z = (end_pos.z - start_pos.z);
  var ax = (end_pos.ax - start_pos.ax);
  var ay = (end_pos.ay - start_pos.ay);
  var az = (end_pos.az - start_pos.az);
  var bx = (end_pos.bx - start_pos.bx);
  var by = (end_pos.by - start_pos.by);
  var bz = (end_pos.bz - start_pos.bz);
  if(ay >= Math.PI)
    ay -= 2*Math.PI;
  if(ay < -Math.PI)
    ay += 2*Math.PI;
  if(by >= Math.PI)
    by -= 2*Math.PI;
  if(by <= -Math.PI)
    by += 2*Math.PI;

  var s = this.easing(step, steps);
  var p = new Position({
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
}

function back_and_forth(start, end, step, steps, easing) {
  var x = (end.x - start.x);
  var y = (end.y - start.y);
  var z = (end.z - start.z);
  var ax = (end.ax - start.ax);
  var ay = (end.ay - start.ay);
  var az = (end.az - start.az);
  var bx = (end.bx - start.bx);
  var by = (end.by - start.by);
  var bz = (end.bz - start.bz);

  var s = this.easing(this.step, this.steps);

  if(s > 0.5)
    s = 1 - s;
  var p = new Position({
    ax: start.ax + s*ax,
    ay: start.ay + s*ay,
    az: start.az + s*az,
    x: start.x + s*x,
    y: start.y + s*y,
    z: start.z + s*z,
    bx: start.bx + s*bx,
    by: start.by + s*by,
    bz: start.bz + s*bz,
  });
  return p;
}
