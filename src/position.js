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
  this.sx = config.sx || 1;
  this.sy = config.sy || 1;
  this.width = config.width;
  this.height = config.height;
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
    bz: this.bz,
    sx: this.sx,
    sy: this.sy
  });
  return p;
};

snabbtjs.Position.prototype.assign = function(p) {
  this.ax = p.ax;
  this.ay = p.ay;
  this.az = p.az;
  this.x = p.x;
  this.y = p.y;
  this.z = p.z;
  this.bx = p.bx;
  this.by = p.by;
  this.bz = p.bz;
  this.sx = p.sx;
  this.sy = p.sy;
};

//  Reuse the same three matrices everytime.
var temp_m = snabbtjs.ident();
var temp_res1 = snabbtjs.ident();
var temp_res2 = snabbtjs.ident();

snabbtjs.Position.prototype.as_matrix = function() {
  // Scale
  snabbtjs.assign_scale(temp_res1, this.sx, this.sy);

  // Pre-rotation
  snabbtjs.assign_rotX(temp_res2, this.ax);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_res2, temp_m);

  snabbtjs.assign_rotY(temp_res1, this.ay);
  snabbtjs.assigned_matrix_multiplication(temp_res1, temp_m, temp_res2);
  snabbtjs.assign_rotZ(temp_m, this.az);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res2, temp_res1);

  // Translation
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_trans(temp_m, this.x, this.y, this.z), temp_res2);

  // Post-rotation
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotX(temp_m, this.bx), temp_res1);
  snabbtjs.assigned_matrix_multiplication(temp_res1, snabbtjs.assign_rotY(temp_m, this.by), temp_res2);
  snabbtjs.assigned_matrix_multiplication(temp_res2, snabbtjs.assign_rotZ(temp_m, this.bz), temp_res1);

  // Final offset
  snabbtjs.assign_trans(temp_m, this.offset_x, this.offset_y, this.offset_z);
  snabbtjs.assigned_matrix_multiplication(temp_m, temp_res1, temp_res2);
  return temp_res2;
};

