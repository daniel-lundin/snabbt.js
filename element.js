function Element(e, x, y, z, rotx, roty, rotz) {
  this.e = e;
  this.x = x;
  this.y = y;
  this.z = z;
  this.rotx = rotx;
  this.roty = roty;
  this.rotz = rotz;
  this.animation = undefined;
}

Element.prototype.tick = function() {
  if(this.animation) {
    if(this.animation.completed()) {
      // If animation is complete, set pos/rot to animation end state
      this.x = this.animation.x;
      this.y = this.animation.y;
      this.z = this.animation.z;
      this.rotx = this.animation.rotx;
      this.roty = this.animation.roty;
      this.rotz = this.animation.rotz;

      this.rotx += 2*Math.PI;
      while(this.rotx >= 2*Math.PI)
        this.rotx -= 2*Math.PI;
      this.roty += 2*Math.PI;
      while(this.roty >= 2*Math.PI)
        this.roty -= 2*Math.PI;
      this.rotz += 2*Math.PI;
      while(this.rotz >= 2*Math.PI)
        this.rotz -= 2*Math.PI;

      this.animation = undefined;
      var p = get_transform(this);
      set_css_transform(this.e, p.m);
    } else {
      this.animation.tick();
      var t = this.animation.current_transform(this);
      set_css_transform(this.e, t.m);
    }
  } else {
    var r = get_transform(this);
    set_css_transform(this.e, r.m);
  }
};


function Position(ax, ay, az, x, y, z, bx, by, bz) {
  if(typeof(ax) === 'undefined') ax = 0;
  if(typeof(ay) === 'undefined') ay = 0;
  if(typeof(az) === 'undefined') az = 0;
  if(typeof(x) === 'undefined') x = 0;
  if(typeof(y) === 'undefined') y = 0;
  if(typeof(z) === 'undefined') z = 0;
  if(typeof(bx) === 'undefined') bx = 0;
  if(typeof(by) === 'undefined') by = 0;
  if(typeof(bz) === 'undefined') bz = 0;
}

Position.prototype.as_matrix = function() {
  var m = ident();
  m = m.mult(rotX(this.ax));
  m = m.mult(rotY(this.ay));
  m = m.mult(rotZ(this.az));
  m = m.mult(trans(this.x, this.y, this.z));
  m = m.mult(rotX(this.bx));
  m = m.mult(rotY(this.by));
  m = m.mult(rotZ(this.bz));
  return m;
}
