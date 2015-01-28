snabbtjs.State = function(config) {
  var optionOrDefault = snabbtjs.optionOrDefault;
  this.position = optionOrDefault(config.position, [0, 0, 0]);
  this.rotation = optionOrDefault(config.rotation, [0, 0, 0]);
  this.rotationPost = optionOrDefault(config.rotationPost, [0, 0, 0]);
  this.skew = optionOrDefault(config.skew, [0, 0]);
  this.scale = optionOrDefault(config.scale, [1, 1]);
  this.opacity = config.opacity;
  this.width = config.width;
  this.height = config.height;
};

snabbtjs.State.prototype.clone = function() {
  var p = new snabbtjs.State({
    position: this.position.slice(0),
    rotation: this.rotation.slice(0),
    rotationPost: this.rotationPost.slice(0),
    skew: this.skew.slice(0),
    scale: this.scale.slice(0),
    height: this.height,
    width: this.width,
    opacity: this.opacity
  });
  return p;
};

snabbtjs.State.prototype.asMatrix = function() {
  var m = new snabbtjs.Matrix();

  if(this.transformOrigin)
    m.translate(-this.transformOrigin[0], -this.transformOrigin[1], -this.transformOrigin[2]);

  m.scale(this.scale[0], this.scale[1]);

  m.skew(this.skew[0], this.skew[1]);

  m.rotateX(this.rotation[0]);
  m.rotateY(this.rotation[1]);
  m.rotateZ(this.rotation[2]);

  m.translate(this.position[0], this.position[1], this.position[2]);

  m.rotateX(this.rotationPost[0]);
  m.rotateY(this.rotationPost[1]);
  m.rotateZ(this.rotationPost[2]);

  if(this.transformOrigin)
    m.translate(this.transformOrigin[0], this.transformOrigin[1], this.transformOrigin[2]);
  return m.data;
};

snabbtjs.State.prototype.properties = function() {
  return {
    opacity: this.opacity,
    width: this.width + 'px',
    height: this.height + 'px'
  };
};
