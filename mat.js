function Matrix(m) {
  this.m = m;
}

Matrix.prototype.mult = function(other) {
  var res = [Array(4), Array(4), Array(4), Array(4)];
  for(var i=0;i<4;++i) {
    for(var j=0;j<4;++j) {
      var sum = 0;
      for(var k=0;k<4;++k) {
        sum += this.m[i][k] * other.m[k][j];
      }
      res[i][j] = sum;
    }
  }
  return new Matrix(res);
};

function mat_to_css(matrix) {
  var css = 'matrix3d(';
  for(var i in matrix) {
    for(var j in matrix[i]) {
      css += matrix[i][j].toFixed(10) + ",";
    }
  }
  return 'perspective(3000px) ' + css.substring(0, css.length - 1) + ')';
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
};

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
