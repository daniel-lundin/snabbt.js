var snabbtjs = snabbtjs || {};

snabbtjs.TweenStates = function(start, end, result, tweenValue) {
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
  var dskewx = (end.skewX - start.skewX);
  var dskewy = (end.skewY - start.skewY);
  var dwidth = (end.width - start.width);
  var dheight = (end.height - start.height);
  var dopacity = (end.opacity - start.opacity);

  result.ax = start.ax + tweenValue*dax;
  result.ay = start.ay + tweenValue*day;
  result.az = start.az + tweenValue*daz;
  result.x = start.x + tweenValue*dx;
  result.y = start.y + tweenValue*dy;
  result.z = start.z + tweenValue*dz;
  result.bx = start.bx + tweenValue*dbx;
  result.by = start.by + tweenValue*dby;
  result.bz = start.bz + tweenValue*dbz;
  result.skewX = start.skewX + tweenValue*dskewx;
  result.skewY = start.skewY + tweenValue*dskewy;
  result.sx = start.sx + tweenValue*dsx;
  result.sy = start.sy + tweenValue*dsy;

  if(end.width !== undefined)
    result.width = start.width + tweenValue*dwidth;
  if(end.height !== undefined)
    result.height = start.height + tweenValue*dheight;
  if(end.opacity !== undefined)
    result.opacity = start.opacity + tweenValue*dopacity;
};
