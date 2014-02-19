function pow2_transition(curr, max) {
  return Math.pow(curr/max, 2);
}

function linear_transition(curr, max) {
  return curr/max;
}

function Animation(x, y, z, rotx, roty, rotz, transition) {
  if(typeof(transition) === 'undefined') transition = linear_transition;
  this.x = x;
  this.y = y;
  this.z = z;
  this.rotx = rotx;
  this.roty = roty;
  this.rotz = rotz;
  this.transition = transition;
  this.step = 0;
  this.steps = 50;
}

Animation.prototype.tick = function(e) {
  this.step++;
};

Animation.prototype.current_transform = function(e) {
  var x = (this.x - e.x);
  var y = (this.y - e.y);
  var z = (this.z - e.z);
  var rotx = (this.rotx - e.rotx);
  var roty = (this.roty - e.roty);
  var rotz = (this.rotz - e.rotz);
  if(roty >= Math.PI)
    roty -= 2*Math.PI;
  if(roty <= -Math.PI)
    roty += 2*Math.PI;

  var s = this.transition(this.step, this.steps);
  var t = {};
  t.x = e.x + s*x;
  t.y = e.y + s*y;
  t.z = e.z + s*z;
  t.rotx = e.rotx + s*rotx;
  t.roty = e.roty + s*roty;
  t.rotz = e.rotz + s*rotz;
  return get_transform(t);
};

Animation.prototype.completed = function() {
  return this.step >= this.steps;
};
