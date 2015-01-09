snabbtjs.State = function(config) {
  this.ax = snabbtjs.optionOrDefault(config.ax, 0);
  this.ay = snabbtjs.optionOrDefault(config.ay, 0);
  this.az = snabbtjs.optionOrDefault(config.az, 0);
  this.x = snabbtjs.optionOrDefault(config.x, 0);
  this.y = snabbtjs.optionOrDefault(config.y, 0);
  this.z = snabbtjs.optionOrDefault(config.z, 0);
  this.bx = snabbtjs.optionOrDefault(config.bx, 0);
  this.by = snabbtjs.optionOrDefault(config.by, 0);
  this.bz = snabbtjs.optionOrDefault(config.bz, 0);
  this.skewX = snabbtjs.optionOrDefault(config.skewX, 0);
  this.skewY = snabbtjs.optionOrDefault(config.skewY, 0);
  this.offsetX = snabbtjs.optionOrDefault(config.offsetX, 0);
  this.offsetY = snabbtjs.optionOrDefault(config.offsetY, 0);
  this.offsetZ = snabbtjs.optionOrDefault(config.offsetZ, 0);
  this.sx = snabbtjs.optionOrDefault(config.sx, 1);
  this.sy = snabbtjs.optionOrDefault(config.sy, 1);
  this.width = config.width;
  this.height = config.height;
  this.opacity = snabbtjs.optionOrDefault(config.opacity, 1);
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
    skewX: this.skewX,
    skewY: this.skewY,
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
  this.skewX = p.skewX;
  this.skewY = p.skewY;
  this.sx = p.sx;
  this.sy = p.sy;
  this.opacity = p.opacity;
  this.height = this.height;
  this.width = this.width;
};

snabbtjs.State.prototype.asMatrix = function() {
  var m = new snabbtjs.Matrix();

  m.translate(this.offsetX, this.offsetY, this.offsetZ);

  m.scale(this.sx, this.sy);
  m.skew(this.skewX, this.skewY);
  m.rotateX(this.ax);
  m.rotateY(this.ay);
  m.rotateZ(this.az);
  m.translate(this.x, this.y, this.z);
  m.rotateX(this.bx);
  m.rotateY(this.by);
  m.rotateZ(this.bz);
  return m.data;
};

snabbtjs.State.prototype.properties = function() {
  return {
    opacity: this.opacity,
    width: this.width + 'px',
    height: this.height + 'px'
  };
};
