function Matrix(m) {
  this.m = m;
}

Matrix.prototype.mult = function(other) {
  var res = [Array(4), Array(4), Array(4), Array(4)];
  // Unrolled loop
  res[0][0] = this.m[0][0] * other.m[0][0] +
              this.m[0][1] * other.m[1][0] +
              this.m[0][2] * other.m[2][0] +
              this.m[0][3] * other.m[3][0];
  res[0][1] = this.m[0][0] * other.m[0][1] +
              this.m[0][1] * other.m[1][1] +
              this.m[0][2] * other.m[2][1] +
              this.m[0][3] * other.m[3][1];
  res[0][2] = this.m[0][0] * other.m[0][2] +
              this.m[0][1] * other.m[1][2] +
              this.m[0][2] * other.m[2][2] +
              this.m[0][3] * other.m[3][2];
  res[0][3] = this.m[0][0] * other.m[0][3] +
              this.m[0][1] * other.m[1][3] +
              this.m[0][2] * other.m[2][3] +
              this.m[0][3] * other.m[3][3];

  res[1][0] = this.m[1][0] * other.m[0][0] +
              this.m[1][1] * other.m[1][0] +
              this.m[1][2] * other.m[2][0] +
              this.m[1][3] * other.m[3][0];
  res[1][1] = this.m[1][0] * other.m[0][1] +
              this.m[1][1] * other.m[1][1] +
              this.m[1][2] * other.m[2][1] +
              this.m[1][3] * other.m[3][1];
  res[1][2] = this.m[1][0] * other.m[0][2] +
              this.m[1][1] * other.m[1][2] +
              this.m[1][2] * other.m[2][2] +
              this.m[1][3] * other.m[3][2];
  res[1][3] = this.m[1][0] * other.m[0][3] +
              this.m[1][1] * other.m[1][3] +
              this.m[1][2] * other.m[2][3] +
              this.m[1][3] * other.m[3][3];

  res[2][0] = this.m[2][0] * other.m[0][0] +
              this.m[2][1] * other.m[1][0] +
              this.m[2][2] * other.m[2][0] +
              this.m[2][3] * other.m[3][0];
  res[2][1] = this.m[2][0] * other.m[0][1] +
              this.m[2][1] * other.m[1][1] +
              this.m[2][2] * other.m[2][1] +
              this.m[2][3] * other.m[3][1];
  res[2][2] = this.m[2][0] * other.m[0][2] +
              this.m[2][1] * other.m[1][2] +
              this.m[2][2] * other.m[2][2] +
              this.m[2][3] * other.m[3][2];
  res[2][3] = this.m[2][0] * other.m[0][3] +
              this.m[2][1] * other.m[1][3] +
              this.m[2][2] * other.m[2][3] +
              this.m[2][3] * other.m[3][3];

  res[3][0] = this.m[3][0] * other.m[0][0] +
              this.m[3][1] * other.m[1][0] +
              this.m[3][2] * other.m[2][0] +
              this.m[3][3] * other.m[3][0];
  res[3][1] = this.m[3][0] * other.m[0][1] +
              this.m[3][1] * other.m[1][1] +
              this.m[3][2] * other.m[2][1] +
              this.m[3][3] * other.m[3][1];
  res[3][2] = this.m[3][0] * other.m[0][2] +
              this.m[3][1] * other.m[1][2] +
              this.m[3][2] * other.m[2][2] +
              this.m[3][3] * other.m[3][2];
  res[3][3] = this.m[3][0] * other.m[0][3] +
              this.m[3][1] * other.m[1][3] +
              this.m[3][2] * other.m[2][3] +
              this.m[3][3] * other.m[3][3];

  return new Matrix(res);
};

function mat_to_css(matrix) {
  var css = 'matrix3d(' +
            matrix[0][0].toFixed(10) + ', ' +
            matrix[0][1].toFixed(10) + ', ' +
            matrix[0][2].toFixed(10) + ', ' +
            matrix[0][3].toFixed(10) + ', ' +
            matrix[1][0].toFixed(10) + ', ' +
            matrix[1][1].toFixed(10) + ', ' +
            matrix[1][2].toFixed(10) + ', ' +
            matrix[1][3].toFixed(10) + ', ' +
            matrix[2][0].toFixed(10) + ', ' +
            matrix[2][1].toFixed(10) + ', ' +
            matrix[2][2].toFixed(10) + ', ' +
            matrix[2][3].toFixed(10) + ', ' +
            matrix[3][0].toFixed(10) + ', ' +
            matrix[3][1].toFixed(10) + ', ' +
            matrix[3][2].toFixed(10) + ', ' +
            matrix[3][3].toFixed(10) + ')';
  return css;

}

var rotX = function(rad) {
  return new Matrix([
    [1, 0, 0, 0],
    [0, Math.cos(rad), -Math.sin(rad), 0],
    [0, Math.sin(rad), Math.cos(rad), 0],
    [0, 0, 0, 1]
  ]);
};

var rotY = function(rad) {
  return new Matrix([
    [Math.cos(rad), 0, Math.sin(rad), 0],
    [0, 1, 0, 0],
    [-Math.sin(rad), 0, Math.cos(rad), 0],
    [0, 0, 0, 1]
  ]);
};

var rotZ = function(rad) {
  return new Matrix([
    [Math.cos(rad), -Math.sin(rad), 0, 0],
    [Math.sin(rad), Math.cos(rad), 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ]);
};

var trans = function(x, y, z) {
  return new Matrix([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [x, y, z, 1]
  ]);
};

var scale = function(x, y, z) {
  return new Matrix([
    [x, 0, 0, 0],
    [0, y, 0, 0],
    [0, 0, z, 0],
    [0, 0, 0, 1]
  ]);
};

var ident = function() {
  return new Matrix([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ]);
};

var transform = function(mat, next) {
  return function() {
    if(!next)
      return mat;
    return mmult(mat, next());
  };
};

var set_css_transform = function(el, matrix) {
  if(el instanceof Array) {
    for(var i=0;i<el.length;++i) {
      el[i].style.webkitTransform = mat_to_css(matrix);
      el[i].style.transform = mat_to_css(matrix);
    }
  } else {
    el.style.webkitTransform = mat_to_css(matrix);
    el.style.transform = mat_to_css(matrix);
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
  this.offset_x = config.offset_x || 0;
  this.offset_y = config.offset_y || 0;
  this.offset_z = config.offset_z || 0;
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
};

Position.prototype.as_matrix = function() {
  var m = ident();
  m = m.mult(rotX(this.ax));
  m = m.mult(rotY(this.ay));
  m = m.mult(rotZ(this.az));
  m = m.mult(trans(this.x, this.y, this.z));
  m = m.mult(rotY(this.by));
  m = m.mult(rotX(this.bx));
  m = m.mult(rotZ(this.bz));
  m = m.mult(trans(this.offset_x, this.offset_y, this.offset_z));
  return m.m;
}
