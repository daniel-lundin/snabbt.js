var snabbtjs = snabbtjs || {};

snabbtjs.TweenStates = function(start, end, result, tweenValue) {
  var dX = (end.position[0] - start.position[0]);
  var dY = (end.position[1] - start.position[1]);
  var dZ = (end.position[2] - start.position[2]);
  var dAX = (end.rotation[0] - start.rotation[0]);
  var dAY = (end.rotation[1] - start.rotation[1]);
  var dAZ = (end.rotation[2] - start.rotation[2]);
  var dBX = (end.rotationPost[0] - start.rotationPost[0]);
  var dBY = (end.rotationPost[1] - start.rotationPost[1]);
  var dBZ = (end.rotationPost[2] - start.rotationPost[2]);
  var dSX = (end.scale[0] - start.scale[0]);
  var dSY = (end.scale[1] - start.scale[1]);
  var dSkewX = (end.skew[0] - start.skew[0]);
  var dSkewY = (end.skew[1] - start.skew[1]);
  var dWidth = (end.width - start.width);
  var dHeight = (end.height - start.height);
  var dOpacity = (end.opacity - start.opacity);

  result.position[0] = start.position[0] + tweenValue*dX;
  result.position[1] = start.position[1] + tweenValue*dY;
  result.position[2] = start.position[2] + tweenValue*dZ;
  result.rotation[0] = start.rotation[0] + tweenValue*dAX;
  result.rotation[1] = start.rotation[1] + tweenValue*dAY;
  result.rotation[2] = start.rotation[2] + tweenValue*dAZ;
  result.rotationPost[0] = start.rotationPost[0] + tweenValue*dBX;
  result.rotationPost[1] = start.rotationPost[1] + tweenValue*dBY;
  result.rotationPost[2] = start.rotationPost[2] + tweenValue*dBZ;
  result.skew[0] = start.skew[0] + tweenValue*dSkewX;
  result.skew[1] = start.skew[1] + tweenValue*dSkewY;
  result.scale[0] = start.scale[0] + tweenValue*dSX;
  result.scale[1] = start.scale[1] + tweenValue*dSY;

  if(end.width !== undefined)
    result.width = start.width + tweenValue*dWidth;
  if(end.height !== undefined)
    result.height = start.height + tweenValue*dHeight;
  if(end.opacity !== undefined)
    result.opacity = start.opacity + tweenValue*dOpacity;
};
