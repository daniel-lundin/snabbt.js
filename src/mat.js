var snabbtjs = snabbtjs || {};

snabbtjs.mult_matrices = function(a, b, res) {
  // Unrolled loop
  res[0] = a[0] * b[0] +
                a[1] * b[4] +
                a[2] * b[8] +
                a[3] * b[12];
  res[1] = a[0] * b[1] +
                a[1] * b[5] +
                a[2] * b[9] +
                a[3] * b[13];
  res[2] = a[0] * b[2] +
                a[1] * b[6] +
                a[2] * b[10] +
                a[3] * b[14];
  res[3] = a[0] * b[3] +
                a[1] * b[7] +
                a[2] * b[11] +
                a[3] * b[15];

  res[4] = a[4] * b[0] +
                a[5] * b[4] +
                a[6] * b[8] +
                a[7] * b[12];
  res[5] = a[4] * b[1] +
                a[5] * b[5] +
                a[6] * b[9] +
                a[7] * b[13];
  res[6] = a[4] * b[2] +
                a[5] * b[6] +
                a[6] * b[10] +
                a[7] * b[14];
  res[7] = a[4] * b[3] +
                a[5] * b[7] +
                a[6] * b[11] +
                a[7] * b[15];

  res[8] = a[8] * b[0] +
                a[9] * b[4] +
                a[10] * b[8] +
                a[11] * b[12];
  res[9] = a[8] * b[1] +
                a[9] * b[5] +
                a[10] * b[9] +
                a[11] * b[13];
  res[10] = a[8] * b[2] +
                a[9] * b[6] +
                a[10] * b[10] +
                a[11] * b[14];
  res[11] = a[8] * b[3] +
                a[9] * b[7] +
                a[10] * b[11] +
                a[11] * b[15];

  res[12] = a[12] * b[0] +
                a[13] * b[4] +
                a[14] * b[8] +
                a[15] * b[12];
  res[13] = a[12] * b[1] +
                a[13] * b[5] +
                a[14] * b[9] +
                a[15] * b[13];
  res[14] = a[12] * b[2] +
                a[13] * b[6] +
                a[14] * b[10] +
                a[15] * b[14];
  res[15] = a[12] * b[3] +
                a[13] * b[7] +
                a[14] * b[11] +
                a[15] * b[15];

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
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotY = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_rotZ = function(m, rad) {
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.assign_trans = function(m, x, y, z) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.scale = function(x, y, z) {
  return [x, 0, 0, 0,
     0, y, 0, 0,
     0, 0, z, 0,
     0, 0, 0, 1];
};

snabbtjs.ident = function() {
  return [1, 0, 0, 0,
     0, 1, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1];
};

snabbtjs.assign_ident = function(m) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
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
  return temp_res1;
};
