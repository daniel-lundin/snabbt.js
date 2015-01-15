snabbtjs.State = function(config) {
  var optionOrDefault = snabbtjs.optionOrDefault;
  this.ax = optionOrDefault(config.ax, 0);
  this.ay = optionOrDefault(config.ay, 0);
  this.az = optionOrDefault(config.az, 0);
  this.x = optionOrDefault(config.x, 0);
  this.y = optionOrDefault(config.y, 0);
  this.z = optionOrDefault(config.z, 0);
  this.bx = optionOrDefault(config.bx, 0);
  this.by = optionOrDefault(config.by, 0);
  this.bz = optionOrDefault(config.bz, 0);
  this.skewX = optionOrDefault(config.skewX, 0);
  this.skewY = optionOrDefault(config.skewY, 0);
  this.offsetX = optionOrDefault(config.offsetX, 0);
  this.offsetY = optionOrDefault(config.offsetY, 0);
  this.offsetZ = optionOrDefault(config.offsetZ, 0);
  this.sx = optionOrDefault(config.sx, 1);
  this.sy = optionOrDefault(config.sy, 1);
  this.width = config.width;
  this.height = config.height;
  this.opacity = optionOrDefault(config.opacity, 1);
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
