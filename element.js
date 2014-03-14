function Element(e, pos, animation_complete) {
  this.e = e;
  this.pos = pos;
  this.animation = undefined;
  this.animation_complete = animation_complete;
}

Element.prototype.tick = function(time) {
  if(this.animation) {
    if(this.animation.completed()) {
      // If animation is complete, set pos/rot to animation end state
      this.pos = this.animation.end_position();

      this.pos.ax += 2*Math.PI;
      while(this.pos.ax >= 2*Math.PI)
        this.pos.ax -= 2*Math.PI;
      this.pos.ay += 2*Math.PI;
      while(this.pos.ay >= 2*Math.PI)
        this.pos.ay -= 2*Math.PI;
      this.pos.az += 2*Math.PI;
      while(this.pos.az >= 2*Math.PI)
        this.pos.az -= 2*Math.PI;
      this.pos.bx += 2*Math.PI;
      while(this.pos.bx >= 2*Math.PI)
        this.pos.bx -= 2*Math.PI;
      this.pos.by += 2*Math.PI;
      while(this.pos.by >= 2*Math.PI)
        this.pos.by -= 2*Math.PI;
      this.pos.bz += 2*Math.PI;
      while(this.pos.bz >= 2*Math.PI)
        this.pos.bz -= 2*Math.PI;

      this.animation = undefined;
      set_css_transform(this.e, this.pos.as_matrix());
      if(this.animation_complete) {
        this.animation_complete();
      }
    } else {
      this.animation.tick(time);
      set_css_transform(this.e, this.animation.current_transform().as_matrix());
    }
  } else {
    set_css_transform(this.e, this.pos.as_matrix());
  }
};


function Position(config) {
  this.ax = config.ax || 0;
  this.ay = config.ay || 0;
  this.az = config.az || 0;
  this.x = config.x || 0;
  this.y = config.y || 0;
  this.z = config.z || 0;
  this.bx = config.bx || 0;
  this.by = config.by || 0;
  this.bz = config.bz || 0;
}

Position.prototype.clone = function() {
  var p = new Position({
    ax: this.ax,
    ay: this.ay,
    az: this.az,
    x: this.x,
    y: this.y,
    z: this.z,
    bx: this.bx,
    by: this.by,
    bz: this.bz
  });
  return p;
}

Position.prototype.as_matrix = function() {
  var m = ident();
  m = m.mult(rotX(this.ax));
  m = m.mult(rotY(this.ay));
  m = m.mult(rotZ(this.az));
  m = m.mult(trans(this.x, this.y, this.z));
  m = m.mult(rotY(this.by));
  m = m.mult(rotX(this.bx));
  m = m.mult(rotZ(this.bz));
  return m.m;
}
