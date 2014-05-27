var snabbtjs = snabbtjs || {};

snabbtjs.Matrix = function(m) {
  this.m = m;
};

snabbtjs.mult_matrices = function(a, b, res) {
  // Unrolled loop
  res.m[0][0] = a.m[0][0] * b.m[0][0] +
                a.m[0][1] * b.m[1][0] +
                a.m[0][2] * b.m[2][0] +
                a.m[0][3] * b.m[3][0];
  res.m[0][1] = a.m[0][0] * b.m[0][1] +
                a.m[0][1] * b.m[1][1] +
                a.m[0][2] * b.m[2][1] +
                a.m[0][3] * b.m[3][1];
  res.m[0][2] = a.m[0][0] * b.m[0][2] +
                a.m[0][1] * b.m[1][2] +
                a.m[0][2] * b.m[2][2] +
                a.m[0][3] * b.m[3][2];
  res.m[0][3] = a.m[0][0] * b.m[0][3] +
                a.m[0][1] * b.m[1][3] +
                a.m[0][2] * b.m[2][3] +
                a.m[0][3] * b.m[3][3];

  res.m[1][0] = a.m[1][0] * b.m[0][0] +
                a.m[1][1] * b.m[1][0] +
                a.m[1][2] * b.m[2][0] +
                a.m[1][3] * b.m[3][0];
  res.m[1][1] = a.m[1][0] * b.m[0][1] +
                a.m[1][1] * b.m[1][1] +
                a.m[1][2] * b.m[2][1] +
                a.m[1][3] * b.m[3][1];
  res.m[1][2] = a.m[1][0] * b.m[0][2] +
                a.m[1][1] * b.m[1][2] +
                a.m[1][2] * b.m[2][2] +
                a.m[1][3] * b.m[3][2];
  res.m[1][3] = a.m[1][0] * b.m[0][3] +
                a.m[1][1] * b.m[1][3] +
                a.m[1][2] * b.m[2][3] +
                a.m[1][3] * b.m[3][3];

  res.m[2][0] = a.m[2][0] * b.m[0][0] +
                a.m[2][1] * b.m[1][0] +
                a.m[2][2] * b.m[2][0] +
                a.m[2][3] * b.m[3][0];
  res.m[2][1] = a.m[2][0] * b.m[0][1] +
                a.m[2][1] * b.m[1][1] +
                a.m[2][2] * b.m[2][1] +
                a.m[2][3] * b.m[3][1];
  res.m[2][2] = a.m[2][0] * b.m[0][2] +
                a.m[2][1] * b.m[1][2] +
                a.m[2][2] * b.m[2][2] +
                a.m[2][3] * b.m[3][2];
  res.m[2][3] = a.m[2][0] * b.m[0][3] +
                a.m[2][1] * b.m[1][3] +
                a.m[2][2] * b.m[2][3] +
                a.m[2][3] * b.m[3][3];

  res.m[3][0] = a.m[3][0] * b.m[0][0] +
                a.m[3][1] * b.m[1][0] +
                a.m[3][2] * b.m[2][0] +
                a.m[3][3] * b.m[3][0];
  res.m[3][1] = a.m[3][0] * b.m[0][1] +
                a.m[3][1] * b.m[1][1] +
                a.m[3][2] * b.m[2][1] +
                a.m[3][3] * b.m[3][1];
  res.m[3][2] = a.m[3][0] * b.m[0][2] +
                a.m[3][1] * b.m[1][2] +
                a.m[3][2] * b.m[2][2] +
                a.m[3][3] * b.m[3][2];
  res.m[3][3] = a.m[3][0] * b.m[0][3] +
                a.m[3][1] * b.m[1][3] +
                a.m[3][2] * b.m[2][3] +
                a.m[3][3] * b.m[3][3];

  return res;
};

snabbtjs.mat_to_css = function(matrix) {
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
};

snabbtjs.assign_rotX = function(m, rad) {
  m.m[0][0] = 1; m.m[0][1] = 0; m.m[0][2] = 0; m.m[0][3] = 0;
  m.m[1][0] = 0; m.m[1][1] = Math.cos(rad); m.m[1][2] = -Math.sin(rad); m.m[1][3] = 0;
  m.m[2][0] = 0; m.m[2][1] = Math.sin(rad); m.m[2][2] = Math.cos(rad); m.m[2][3] = 0;
  m.m[3][0] = 0; m.m[3][1] = 0; m.m[3][2] = 0; m.m[3][3] = 1;
  return m;
};

snabbtjs.assign_rotY = function(m, rad) {
  m.m[0][0] = Math.cos(rad); m.m[0][1] = 0; m.m[0][2] = Math.sin(rad); m.m[0][3] = 0;
  m.m[1][0] = 0; m.m[1][1] = 1; m.m[1][2] = 0; m.m[1][3] = 0;
  m.m[2][0] = -Math.sin(rad); m.m[2][1] = 0; m.m[2][2] = Math.cos(rad); m.m[2][3] = 0;
  m.m[3][0] = 0; m.m[3][1] = 0; m.m[3][2] = 0; m.m[3][3] = 1;
  return m;
};

snabbtjs.assign_rotZ = function(m, rad) {
  m.m[0][0] = Math.cos(rad); m.m[0][1] = -Math.sin(rad); m.m[0][2] = 0; m.m[0][3] = 0;
  m.m[1][0] = Math.sin(rad); m.m[1][1] = Math.cos(rad); m.m[1][2] = 0; m.m[1][3] = 0;
  m.m[2][0] = 0; m.m[2][1] = 0; m.m[2][2] = 1; m.m[2][3] = 0;
  m.m[3][0] = 0; m.m[3][1] = 0; m.m[3][2] = 0; m.m[3][3] = 1;
  return m;
};

snabbtjs.assign_trans = function(m, x, y, z) {
  m.m[0][0] = 1; m.m[0][1] = 0; m.m[0][2] = 0; m.m[0][3] = 0;
  m.m[1][0] = 0; m.m[1][1] = 1; m.m[1][2] = 0; m.m[1][3] = 0;
  m.m[2][0] = 0; m.m[2][1] = 0; m.m[2][2] = 1; m.m[2][3] = 0;
  m.m[3][0] = x; m.m[3][1] = y; m.m[3][2] = z; m.m[3][3] = 1;
  return m;
};

snabbtjs.scale = function(x, y, z) {
  return new snabbtjs.Matrix([
    [x, 0, 0, 0],
    [0, y, 0, 0],
    [0, 0, z, 0],
    [0, 0, 0, 1]
  ]);
};

snabbtjs.ident = function() {
  return new snabbtjs.Matrix([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ]);
};

snabbtjs.assign_ident = function(m) {
  m.m[0][0] = 1; m.m[0][1] = 0; m.m[0][2] = 0; m.m[0][3] = 0;
  m.m[1][0] = 0; m.m[1][1] = 1; m.m[1][2] = 0; m.m[1][3] = 0;
  m.m[2][0] = 0; m.m[2][1] = 0; m.m[2][2] = 1; m.m[2][3] = 0;
  m.m[3][0] = 0; m.m[3][1] = 0; m.m[3][2] = 0; m.m[3][3] = 1;
  return m;
};


snabbtjs.set_css_transform = function(el, matrix) {
  if(el instanceof Array) {
    for(var i=0;i<el.length;++i) {
      el[i].style.webkitTransform = mat_to_css(matrix);
      el[i].style.transform = mat_to_css(matrix);
    }
  } else {
    el.style.webkitTransform = snabbtjs.mat_to_css(matrix);
    el.style.transform = snabbtjs.mat_to_css(matrix);
  }
};

snabbtjs.Position = function(config) {
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
};

snabbtjs.Position.prototype.clone = function() {
  var p = new snabbtjs.Position({
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

//  reuse the same three matrices everytime.
//  Allocation causes lag
var temp_m = snabbtjs.ident();
var temp_res1 = snabbtjs.ident();
var temp_res2 = snabbtjs.ident();

snabbtjs.Position.prototype.as_matrix = function() {
  snabbtjs.assign_rotX(temp_m, this.ax);
  snabbtjs.assign_rotY(temp_res1, this.ay);
  snabbtjs.mult_matrices(temp_res1, temp_m, temp_res2);
  snabbtjs.assign_rotZ(temp_m, this.az);
  snabbtjs.mult_matrices(temp_m, temp_res2, temp_res1);
  snabbtjs.mult_matrices(temp_res1, snabbtjs.assign_trans(temp_m, this.x, this.y, this.z), temp_res2);
  snabbtjs.mult_matrices(temp_res2, snabbtjs.assign_rotX(temp_m, this.bx), temp_res1);
  snabbtjs.mult_matrices(temp_res1, snabbtjs.assign_rotX(temp_m, this.by), temp_res2);
  snabbtjs.mult_matrices(temp_res2, snabbtjs.assign_rotX(temp_m, this.bz), temp_res1);
  snabbtjs.mult_matrices(snabbtjs.assign_trans(temp_m, this.offset_x, this.offset_y, this.offset_z), temp_res1, temp_res2);
  return temp_res1.m;
};
