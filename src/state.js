snabbtjs.State = function(config) {
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

snabbtjs.State.prototype.as_matrix = function() {
  // Scale
  var m = snabbtjs.scale(this.sx, this.sy);

  // Pre-rotation
  m = snabbtjs.mult(m, snabbtjs.rotX(this.ax));
  m = snabbtjs.mult(m, snabbtjs.rotY(this.ay));
  m = snabbtjs.mult(m, snabbtjs.rotZ(this.az));

  // Translation
  m = snabbtjs.mult(m, snabbtjs.trans(this.x, this.y, this.z));

  // Post-rotation
  m = snabbtjs.mult(m, snabbtjs.rotX(this.bx));
  m = snabbtjs.mult(m, snabbtjs.rotY(this.by));
  m = snabbtjs.mult(m, snabbtjs.rotZ(this.bz));

  // Final offset
  m = snabbtjs.mult(snabbtjs.trans(this.offset_x, this.offset_y, this.offset_z), m);
  return m;
};

