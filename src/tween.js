var snabbtjs = snabbtjs || {};

// ------------------
// -- StateTweener -- 
// -------------------

snabbtjs.StateTweener = function(startState, endState, resultState) {
  this.start = startState;
  this.end = endState;
  this.result = resultState;
};

snabbtjs.StateTweener.prototype.tween = function(tweenValue) {
  var dX = (this.end.position[0] - this.start.position[0]);
  var dY = (this.end.position[1] - this.start.position[1]);
  var dZ = (this.end.position[2] - this.start.position[2]);
  var dAX = (this.end.rotation[0] - this.start.rotation[0]);
  var dAY = (this.end.rotation[1] - this.start.rotation[1]);
  var dAZ = (this.end.rotation[2] - this.start.rotation[2]);
  var dBX = (this.end.rotationPost[0] - this.start.rotationPost[0]);
  var dBY = (this.end.rotationPost[1] - this.start.rotationPost[1]);
  var dBZ = (this.end.rotationPost[2] - this.start.rotationPost[2]);
  var dSX = (this.end.scale[0] - this.start.scale[0]);
  var dSY = (this.end.scale[1] - this.start.scale[1]);
  var dSkewX = (this.end.skew[0] - this.start.skew[0]);
  var dSkewY = (this.end.skew[1] - this.start.skew[1]);
  var dWidth = (this.end.width - this.start.width);
  var dHeight = (this.end.height - this.start.height);
  var dOpacity = (this.end.opacity - this.start.opacity);

  this.result.position[0] = this.start.position[0] + tweenValue*dX;
  this.result.position[1] = this.start.position[1] + tweenValue*dY;
  this.result.position[2] = this.start.position[2] + tweenValue*dZ;
  this.result.rotation[0] = this.start.rotation[0] + tweenValue*dAX;
  this.result.rotation[1] = this.start.rotation[1] + tweenValue*dAY;
  this.result.rotation[2] = this.start.rotation[2] + tweenValue*dAZ;
  this.result.rotationPost[0] = this.start.rotationPost[0] + tweenValue*dBX;
  this.result.rotationPost[1] = this.start.rotationPost[1] + tweenValue*dBY;
  this.result.rotationPost[2] = this.start.rotationPost[2] + tweenValue*dBZ;
  this.result.skew[0] = this.start.skew[0] + tweenValue*dSkewX;
  this.result.skew[1] = this.start.skew[1] + tweenValue*dSkewY;
  this.result.scale[0] = this.start.scale[0] + tweenValue*dSX;
  this.result.scale[1] = this.start.scale[1] + tweenValue*dSY;

  if(this.end.width !== undefined)
    this.result.width = this.start.width + tweenValue*dWidth;
  if(this.end.height !== undefined)
    this.result.height = this.start.height + tweenValue*dHeight;
  if(this.end.opacity !== undefined)
    this.result.opacity = this.start.opacity + tweenValue*dOpacity;
};

snabbtjs.StateTweener.prototype.asMatrix = function() {
  return this.result.asMatrix();
};

snabbtjs.StateTweener.prototype.getProperties = function() {
  return this.result.getProperties();
};

snabbtjs.StateTweener.prototype.setReverse = function() {
  var oldStart = this.start;
  this.start = this.end;
  this.end = oldStart;
};

// ------------------------
// -- ValueFeederTweener -- 
// ------------------------

snabbtjs.ValueFeederTweener = function(valueFeeder, startState, endState, resultState) {
  this.currentMatrix = valueFeeder(0, new snabbtjs.Matrix());
  this.valueFeeder = valueFeeder;
  this.start = startState;
  this.end = endState;
  this.result = resultState;
};

snabbtjs.ValueFeederTweener.prototype.tween = function(tweenValue) {
  if(this.reverse)
    tweenValue = 1 - tweenValue;
  this.currentMatrix.clear();
  this.currentMatrix = this.valueFeeder(tweenValue, this.currentMatrix);

  var dWidth = (this.end.width - this.start.width);
  var dHeight = (this.end.height - this.start.height);
  var dOpacity = (this.end.opacity - this.start.opacity);

  if(this.end.width !== undefined)
    this.result.width = this.start.width + tweenValue*dWidth;
  if(this.end.height !== undefined)
    this.result.height = this.start.height + tweenValue*dHeight;
  if(this.end.opacity !== undefined)
    this.result.opacity = this.start.opacity + tweenValue*dOpacity;
};

snabbtjs.ValueFeederTweener.prototype.asMatrix = function() {
  return this.currentMatrix;
};

snabbtjs.ValueFeederTweener.prototype.getProperties = function() {
  return this.result.getProperties();
};

snabbtjs.ValueFeederTweener.prototype.setReverse = function() {
  this.reverse = true;
};
