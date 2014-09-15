var snabbtjs = snabbtjs || {};

snabbtjs.assigned_matrix_multiplication = function(a, b, res) {
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

//snabbtjs.mat_to_css = function(matrix) {
//  var css = 'matrix3d(';
//  var MIN = 0.00000001;
//  for(var i=0;i<matrix.length-1;++i) {
//    if(matrix[i] < MIN)
//      css += '0,';
//    else
//      css += matrix[i].toFixed(10) + ",";
//  }
//  if(matrix[15] < MIN)
//    css += '0';
//  else
//    css += matrix[15].toFixed(10);
//  return css + ")";
//};

snabbtjs.mat_to_css = function(matrix) {
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

snabbtjs.mult = function(a, b) {
  var m = new Float32Array(16);
  snabbtjs.assigned_matrix_multiplication(a, b, m);
  return m;
};

snabbtjs.rotX = function(rad) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.assign_rotX = function(m, rad) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = Math.cos(rad); m[6] = -Math.sin(rad); m[7] = 0;
  m[8] = 0; m[9] = Math.sin(rad); m[10] = Math.cos(rad); m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};

snabbtjs.rotY = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = 0; m[2] = Math.sin(rad); m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = -Math.sin(rad); m[9] = 0; m[10] = Math.cos(rad); m[11] = 0;
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

snabbtjs.rotZ = function(rad) {
  var m = new Float32Array(16);
  m[0] = Math.cos(rad); m[1] = -Math.sin(rad); m[2] = 0; m[3] = 0;
  m[4] = Math.sin(rad); m[5] = Math.cos(rad); m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
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

snabbtjs.trans = function(x, y, z) {
  var m = new Float32Array(16);
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.assign_trans = function(m, x, y, z) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m;
};

snabbtjs.scale = function(x, y) {
  return new Float32Array([
     x, 0, 0, 0,
     0, y, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_scale = function(m, x, y) {
  m[0] = x; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = y; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.ident = function() {
  return new Float32Array([
     1, 0, 0, 0,
     0, 1, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ]);
};

snabbtjs.assign_ident = function(m) {
  m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
  m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
  m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m;
};


snabbtjs.set_css = function(el, state) {
  var matrix = state.as_matrix();
  if(el.hasOwnProperty('length')) {
    for(var i=0;i<el.length;++i) {
      el[i].style.webkitTransform = snabbtjs.mat_to_css(matrix);
      el[i].style.transform = snabbtjs.mat_to_css(matrix);
      if(state.width !== undefined)
        el[i].style.width = state.width + 'px';
      if(state.height !== undefined)
        el[i].style.height = state.height + 'px';
      if(state.opacity !== undefined)
        el[i].style.opacity = state.opacity;
    }
  } else {
    el.style.webkitTransform = snabbtjs.mat_to_css(matrix);
    el.style.transform = snabbtjs.mat_to_css(matrix);
    if(state.width !== undefined)
      el.style.width = state.width + 'px';
    if(state.height !== undefined)
      el.style.height = state.height + 'px';
    if(state.opacity !== undefined)
      el.style.opacity = state.opacity;
  }
};

