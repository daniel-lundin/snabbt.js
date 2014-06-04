var snabbtjs = snabbtjs || {};

snabbtjs.Matrix = function(m) {
  this.m = m;
};

snabbtjs.mult_matrices = function(a, b, res) {
  // Unrolled loop
  res.m[0] = a.m[0] * b.m[0] +
                a.m[1] * b.m[4] +
                a.m[2] * b.m[8] +
                a.m[3] * b.m[12];
  res.m[1] = a.m[0] * b.m[1] +
                a.m[1] * b.m[5] +
                a.m[2] * b.m[9] +
                a.m[3] * b.m[13];
  res.m[2] = a.m[0] * b.m[2] +
                a.m[1] * b.m[6] +
                a.m[2] * b.m[10] +
                a.m[3] * b.m[14];
  res.m[3] = a.m[0] * b.m[3] +
                a.m[1] * b.m[7] +
                a.m[2] * b.m[11] +
                a.m[3] * b.m[15];

  res.m[4] = a.m[4] * b.m[0] +
                a.m[5] * b.m[4] +
                a.m[6] * b.m[8] +
                a.m[7] * b.m[12];
  res.m[5] = a.m[4] * b.m[1] +
                a.m[5] * b.m[5] +
                a.m[6] * b.m[9] +
                a.m[7] * b.m[13];
  res.m[6] = a.m[4] * b.m[2] +
                a.m[5] * b.m[6] +
                a.m[6] * b.m[10] +
                a.m[7] * b.m[14];
  res.m[7] = a.m[4] * b.m[3] +
                a.m[5] * b.m[7] +
                a.m[6] * b.m[11] +
                a.m[7] * b.m[15];

  res.m[8] = a.m[8] * b.m[0] +
                a.m[9] * b.m[4] +
                a.m[10] * b.m[8] +
                a.m[11] * b.m[12];
  res.m[9] = a.m[8] * b.m[1] +
                a.m[9] * b.m[5] +
                a.m[10] * b.m[9] +
                a.m[11] * b.m[13];
  res.m[10] = a.m[8] * b.m[2] +
                a.m[9] * b.m[6] +
                a.m[10] * b.m[10] +
                a.m[11] * b.m[14];
  res.m[11] = a.m[8] * b.m[3] +
                a.m[9] * b.m[7] +
                a.m[10] * b.m[11] +
                a.m[11] * b.m[15];

  res.m[12] = a.m[12] * b.m[0] +
                a.m[13] * b.m[4] +
                a.m[14] * b.m[8] +
                a.m[15] * b.m[12];
  res.m[13] = a.m[12] * b.m[1] +
                a.m[13] * b.m[5] +
                a.m[14] * b.m[9] +
                a.m[15] * b.m[13];
  res.m[14] = a.m[12] * b.m[2] +
                a.m[13] * b.m[6] +
                a.m[14] * b.m[10] +
                a.m[15] * b.m[14];
  res.m[15] = a.m[12] * b.m[3] +
                a.m[13] * b.m[7] +
                a.m[14] * b.m[11] +
                a.m[15] * b.m[15];

  return res;
};

snabbtjs.mat_to_css = function(matrix) {
  //return 'matrix3d(' + matrix.join(',') + ')';
  var css = 'matrix3d(' +
            matrix[0].toFixed(10) + ', ' +
            matrix[1].toFixed(10) + ', ' +
            matrix[2].toFixed(10) + ', ' +
            matrix[3].toFixed(10) + ', ' +
            matrix[4].toFixed(10) + ', ' +
            matrix[5].toFixed(10) + ', ' +
            matrix[6].toFixed(10) + ', ' +
            matrix[7].toFixed(10) + ', ' +
            matrix[8].toFixed(10) + ', ' +
            matrix[9].toFixed(10) + ', ' +
            matrix[10].toFixed(10) + ', ' +
            matrix[11].toFixed(10) + ', ' +
            matrix[12].toFixed(10) + ', ' +
            matrix[13].toFixed(10) + ', ' +
            matrix[14].toFixed(10) + ', ' +
            matrix[15].toFixed(10) + ')';
  return css;
};

snabbtjs.assign_rotX = function(m, rad) {
  m.m[0] = 1; m.m[1] = 0; m.m[2] = 0; m.m[3] = 0;
  m.m[4] = 0; m.m[5] = Math.cos(rad); m.m[6] = -Math.sin(rad); m.m[7] = 0;
  m.m[8] = 0; m.m[9] = Math.sin(rad); m.m[10] = Math.cos(rad); m.m[11] = 0;
  m.m[12] = 0; m.m[13] = 0; m.m[14] = 0; m.m[15] = 1;
  return m;
};

snabbtjs.assign_rotY = function(m, rad) {
  m.m[0] = Math.cos(rad); m.m[1] = 0; m.m[2] = Math.sin(rad); m.m[3] = 0;
  m.m[4] = 0; m.m[5] = 1; m.m[6] = 0; m.m[7] = 0;
  m.m[8] = -Math.sin(rad); m.m[9] = 0; m.m[10] = Math.cos(rad); m.m[11] = 0;
  m.m[12] = 0; m.m[13] = 0; m.m[14] = 0; m.m[15] = 1;
  return m;
};

snabbtjs.assign_rotZ = function(m, rad) {
  m.m[0] = Math.cos(rad); m.m[1] = -Math.sin(rad); m.m[2] = 0; m.m[3] = 0;
  m.m[4] = Math.sin(rad); m.m[5] = Math.cos(rad); m.m[6] = 0; m.m[7] = 0;
  m.m[8] = 0; m.m[9] = 0; m.m[10] = 1; m.m[11] = 0;
  m.m[12] = 0; m.m[13] = 0; m.m[14] = 0; m.m[15] = 1;
  return m;
};

snabbtjs.assign_trans = function(m, x, y, z) {
  m.m[0] = 1; m.m[1] = 0; m.m[2] = 0; m.m[3] = 0;
  m.m[4] = 0; m.m[5] = 1; m.m[6] = 0; m.m[7] = 0;
  m.m[8] = 0; m.m[9] = 0; m.m[10] = 1; m.m[11] = 0;
  m.m[12] = x; m.m[13] = y; m.m[14] = z; m.m[15] = 1;
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
  m.m[0] = 1; m.m[1] = 0; m.m[2] = 0; m.m[3] = 0;
  m.m[4] = 0; m.m[5] = 1; m.m[6] = 0; m.m[7] = 0;
  m.m[8] = 0; m.m[9] = 0; m.m[10] = 1; m.m[11] = 0;
  m.m[12] = 0; m.m[13] = 0; m.m[14] = 0; m.m[15] = 1;
  return m;
};


snabbtjs.set_css_transform = function(el, matrix) {
  if(el instanceof Array) {
    for(var i=0;i<el.length;++i) {
      el[i].style.webkitTransform = mat_to_css(matrix);
      //el[i].style.transform = mat_to_css(matrix);
    }
  } else {
    el.style.webkitTransform = snabbtjs.mat_to_css(matrix);
    //el.style.transform = snabbtjs.mat_to_css(matrix);
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
  snabbtjs.mult_matrices(temp_res1, snabbtjs.assign_rotY(temp_m, this.by), temp_res2);
  snabbtjs.mult_matrices(temp_res2, snabbtjs.assign_rotZ(temp_m, this.bz), temp_res1);
  //snabbtjs.mult_matrices(snabbtjs.assign_trans(temp_m, this.offset_x, this.offset_y, this.offset_z), temp_res1, temp_res2);
  return temp_res1.m;
};
