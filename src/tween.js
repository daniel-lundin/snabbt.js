var snabbtjs = snabbtjs || {};

snabbtjs.TweenStates = function(start, end, result, tween_value) {
  var dx = (end.x - start.x);
  var dy = (end.y - start.y);
  var dz = (end.z - start.z);
  var dax = (end.ax - start.ax);
  var day = (end.ay - start.ay);
  var daz = (end.az - start.az);
  var dbx = (end.bx - start.bx);
  var dby = (end.by - start.by);
  var dbz = (end.bz - start.bz);
  var dsx = (end.sx - start.sx);
  var dsy = (end.sy - start.sy);
  var dskewx = (end.skew_x - start.skew_x);
  var dskewy = (end.skew_y - start.skew_y);
  var dwidth = (end.width - start.width);
  var dheight = (end.height - start.height);
  var dopacity = (end.opacity - start.opacity);

  result.ax = start.ax + tween_value*dax;
  result.ay = start.ay + tween_value*day;
  result.az = start.az + tween_value*daz;
  result.x = start.x + tween_value*dx;
  result.y = start.y + tween_value*dy;
  result.z = start.z + tween_value*dz;
  result.bx = start.bx + tween_value*dbx;
  result.by = start.by + tween_value*dby;
  result.bz = start.bz + tween_value*dbz;
  result.skew_x = start.skew_x + tween_value*dskewx;
  result.skew_y = start.skew_y + tween_value*dskewy;
  result.sx = start.sx + tween_value*dsx;
  result.sy = start.sy + tween_value*dsy;

  if(end.width !== undefined)
    result.width = start.width + tween_value*dwidth;
  if(end.height !== undefined)
    result.height = start.height + tween_value*dheight;
  if(end.opacity !== undefined)
    result.opacity = start.opacity + tween_value*dopacity;
};
