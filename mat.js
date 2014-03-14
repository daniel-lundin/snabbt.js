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
  var css = 'perspective(1000px) matrix3d(' +
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
  el.style.webkitTransform = mat_to_css(matrix);
  el.style.transform = mat_to_css(matrix);
};

function get_transform(obj) {
  var m = ident();
  m = m.mult(rotX(obj.rotx));
  m = m.mult(rotY(obj.roty));
  m = m.mult(rotZ(obj.rotz));
  m = m.mult(trans(obj.x, obj.y, obj.z));
  return m;
}

var element = function(e, matrix) {
  return {
    element: e,
    matrix: matrix
  };
};

var group = function(elems, matrix) {
  return {
    elems: elems,
    matrix: matrix
  };
}
