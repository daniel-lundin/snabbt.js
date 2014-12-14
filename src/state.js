snabbtjs.State = function(config) {
  this.ax = snabbtjs.option_or_default(config.ax, 0);
  this.ay = snabbtjs.option_or_default(config.ay, 0);
  this.az = snabbtjs.option_or_default(config.az, 0);
  this.x = snabbtjs.option_or_default(config.x, 0);
  this.y = snabbtjs.option_or_default(config.y, 0);
  this.z = snabbtjs.option_or_default(config.z, 0);
  this.bx = snabbtjs.option_or_default(config.bx, 0);
  this.by = snabbtjs.option_or_default(config.by, 0);
  this.bz = snabbtjs.option_or_default(config.bz, 0);
  this.skew_x = snabbtjs.option_or_default(config.skew_x, 0);
  this.skew_y = snabbtjs.option_or_default(config.skew_y, 0);
  this.offset_x = snabbtjs.option_or_default(config.offset_x, 0);
  this.offset_y = snabbtjs.option_or_default(config.offset_y, 0);
  this.offset_z = snabbtjs.option_or_default(config.offset_z, 0);
  this.sx = snabbtjs.option_or_default(config.sx, 1);
  this.sy = snabbtjs.option_or_default(config.sy, 1);
  this.width = config.width;
  this.height = config.height;
  this.opacity = snabbtjs.option_or_default(config.opacity, 1);
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
    skew_x: this.skew_x,
    skew_y: this.skew_y,
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
  this.skew_x = p.skew_x;
  this.skew_y = p.skew_y;
  this.sx = p.sx;
  this.sy = p.sy;
  this.opacity = p.opacity;
  this.height = this.height;
  this.width = this.width;
};

snabbtjs.State.prototype.as_matrix = function() {
  // Scale
  var m = snabbtjs.scale(this.sx, this.sy);

  // Skew
  m = snabbtjs.mult(m, snabbtjs.skew(this.skew_x, this.skew_y));

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

snabbtjs.State.prototype.properties = function() {
  return {
    opacity: this.opacity,
    width: this.width + 'px',
    height: this.height + 'px'
  };
};
