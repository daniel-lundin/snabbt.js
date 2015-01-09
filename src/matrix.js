var snabbtjs = snabbtjs || {};

snabbtjs.assignTranslate = function(matrix, x, y, z) {
  matrix[0] = 1;
  matrix[1] = 0;
  matrix[2] = 0;
  matrix[3] = 0;
  matrix[4] = 0;
  matrix[5] = 1;
  matrix[6] = 0;
  matrix[7] = 0;
  matrix[8] = 0;
  matrix[9] = 0;
  matrix[10] = 1;
  matrix[11] = 0;
  matrix[12] = x;
  matrix[13] = y;
  matrix[14] = z;
  matrix[15] = 1;
};

snabbtjs.assignRotateX = function(matrix, rad) {
  matrix[0] = 1;
  matrix[1] = 0;
  matrix[2] = 0;
  matrix[3] = 0;
  matrix[4] = 0;
  matrix[5] = Math.cos(rad);
  matrix[6] = -Math.sin(rad);
  matrix[7] = 0;
  matrix[8] = 0;
  matrix[9] = Math.sin(rad);
  matrix[10] = Math.cos(rad);
  matrix[11] = 0;
  matrix[12] = 0;
  matrix[13] = 0;
  matrix[14] = 0;
  matrix[15] = 1;
};


snabbtjs.assignRotateY = function(matrix, rad) {
  matrix[0] = Math.cos(rad);
  matrix[1] = 0;
  matrix[2] = Math.sin(rad);
  matrix[3] = 0;
  matrix[4] = 0;
  matrix[5] = 1;
  matrix[6] = 0;
  matrix[7] = 0;
  matrix[8] = -Math.sin(rad);
  matrix[9] = 0;
  matrix[10] = Math.cos(rad);
  matrix[11] = 0;
  matrix[12] = 0;
  matrix[13] = 0;
  matrix[14] = 0;
  matrix[15] = 1;
};

snabbtjs.assignRotateZ = function(matrix, rad) {
  matrix[0] = Math.cos(rad);
  matrix[1] = -Math.sin(rad);
  matrix[2] = 0;
  matrix[3] = 0;
  matrix[4] = Math.sin(rad);
  matrix[5] = Math.cos(rad);
  matrix[6] = 0;
  matrix[7] = 0;
  matrix[8] = 0;
  matrix[9] = 0;
  matrix[10] = 1;
  matrix[11] = 0;
  matrix[12] = 0;
  matrix[13] = 0;
  matrix[14] = 0;
  matrix[15] = 1;
};

snabbtjs.assignSkew = function(matrix, ax, ay) {
  matrix[0] = 1;
  matrix[1] = Math.tan(ax);
  matrix[2] = 0;
  matrix[3] = 0;
  matrix[4] = Math.tan(ay);
  matrix[5] = 1;
  matrix[6] = 0;
  matrix[7] = 0;
  matrix[8] = 0;
  matrix[9] = 0;
  matrix[10] = 1;
  matrix[11] = 0;
  matrix[12] = 0;
  matrix[13] = 0;
  matrix[14] = 0;
  matrix[15] = 1;
};


snabbtjs.assignScale = function(matrix, x, y) {
  matrix[0] = x;
  matrix[1] = 0;
  matrix[2] = 0;
  matrix[3] = 0;
  matrix[4] = 0;
  matrix[5] = y;
  matrix[6] = 0;
  matrix[7] = 0;
  matrix[8] = 0;
  matrix[9] = 0;
  matrix[10] = 1;
  matrix[11] = 0;
  matrix[12] = 0;
  matrix[13] = 0;
  matrix[14] = 0;
  matrix[15] = 1;
};

snabbtjs.assignIdentity = function(matrix) {
  matrix[0] = 1;
  matrix[1] = 0;
  matrix[2] = 0;
  matrix[3] = 0;
  matrix[4] = 0;
  matrix[5] = 1;
  matrix[6] = 0;
  matrix[7] = 0;
  matrix[8] = 0;
  matrix[9] = 0;
  matrix[10] = 1;
  matrix[11] = 0;
  matrix[12] = 0;
  matrix[13] = 0;
  matrix[14] = 0;
  matrix[15] = 1;
};

snabbtjs.copyArray = function(a, b) {
  b[0] = a[0];
  b[1] = a[1];
  b[2] = a[2];
  b[3] = a[3];
  b[4] = a[4];
  b[5] = a[5];
  b[6] = a[6];
  b[7] = a[7];
  b[8] = a[8];
  b[9] = a[9];
  b[10] = a[10];
  b[11] = a[11];
  b[12] = a[12];
  b[13] = a[13];
  b[14] = a[14];
  b[15] = a[15];
};

snabbtjs.Matrix = function() {
  this.data = new Float32Array(16);
  this.a = new Float32Array(16);
  this.b = new Float32Array(16);
  snabbtjs.assignIdentity(this.data);
};

snabbtjs.Matrix.prototype.clear = function() {
  snabbtjs.assignIdentity(this.data);
};

snabbtjs.Matrix.prototype.translate = function(x, y, z) {
  snabbtjs.copyArray(this.data, this.a);
  snabbtjs.assignTranslate(this.b, x, y, z);
  snabbtjs.assignedMatrixMultiplication(this.a, this.b, this.data);
  return this;
};

snabbtjs.Matrix.prototype.rotateX = function(radians) {
  snabbtjs.copyArray(this.data, this.a);
  snabbtjs.assignRotateX(this.b, radians);
  snabbtjs.assignedMatrixMultiplication(this.a, this.b, this.data);
  return this;
};

snabbtjs.Matrix.prototype.rotateY = function(radians) {
  snabbtjs.copyArray(this.data, this.a);
  snabbtjs.assignRotateY(this.b, radians);
  snabbtjs.assignedMatrixMultiplication(this.a, this.b, this.data);
  return this;
};

snabbtjs.Matrix.prototype.rotateZ = function(radians) {
  snabbtjs.copyArray(this.data, this.a);
  snabbtjs.assignRotateZ(this.b, radians);
  snabbtjs.assignedMatrixMultiplication(this.a, this.b, this.data);
  return this;
};

snabbtjs.Matrix.prototype.scale = function(x, y) {
  snabbtjs.copyArray(this.data, this.a);
  snabbtjs.assignScale(this.b, x, y);
  snabbtjs.assignedMatrixMultiplication(this.a, this.b, this.data);
  return this;
};

snabbtjs.Matrix.prototype.skew = function(ax, ay) {
  snabbtjs.copyArray(this.data, this.a);
  snabbtjs.assignSkew(this.b, ax, ay);
  snabbtjs.assignedMatrixMultiplication(this.a, this.b, this.data);
  return this;
};

snabbtjs.assignedMatrixMultiplication = function(a, b, res) {
  // Unrolled loop
  res[0] = a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12];
  res[1] = a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13];
  res[2] = a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14];
  res[3] = a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15];

  res[4] = a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12];
  res[5] = a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13];
  res[6] = a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14];
  res[7] = a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15];

  res[8] = a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12];
  res[9] = a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13];
  res[10] = a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14];
  res[11] = a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15];

  res[12] = a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12];
  res[13] = a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13];
  res[14] = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14];
  res[15] = a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15];

  return res;
};

snabbtjs.matrixToCSS = function(matrix) {
  var css = 'matrix3d(';
  for(var i=0;i<matrix.length-1;++i) {
    if(Math.abs(matrix[i]) < 0.01)
      css += '0,';
    else
      css += matrix[i].toFixed(10) + '0,';
  }
  css += matrix[15].toFixed(10) + ')';
  return css;
};

snabbtjs.setCSS = function(el, matrix) {
  el.style.webkitTransform = snabbtjs.matrixToCSS(matrix);
  el.style.transform = snabbtjs.matrixTCSS(matrix);
};
