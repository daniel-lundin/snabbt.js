// Steppers

var snabbtjs = snabbtjs || {};

snabbtjs.linearEasing = function(value) {
  return value;
};

snabbtjs.ease = function(value) {
  return (Math.cos(value*Math.PI + Math.PI) + 1)/2;
};

snabbtjs.easeIn = function(value) {
  return value*value;
};

snabbtjs.easeOut = function(value) {
  return -Math.pow(value - 1, 2) + 1;
};

snabbtjs.SpringEasing = function(options) {
  this.position = snabbtjs.optionOrDefault(options.startPosition, 0);
  this.equilibriumPosition = snabbtjs.optionOrDefault(options.equilibriumPosition, 1);
  this.velocity = snabbtjs.optionOrDefault(options.initialVelocity, 0);
  this.springConstant = snabbtjs.optionOrDefault(options.springConstant, 0.8);
  this.deacceleration = snabbtjs.optionOrDefault(options.springDeacceleration, 0.9);
  this.mass = snabbtjs.optionOrDefault(options.springMass, 10);

  this.equilibrium = false;
};

snabbtjs.SpringEasing.prototype.tick = function(value) {
  if(value === 0.0)
    return;
  if(this.equilibrium)
    return;
  var springForce = -(this.position - this.equilibriumPosition) * this.springConstant;
  // f = m * a
  // a = f / m
  var a = springForce / this.mass;
  // s = v * t
  // t = 1 ( for now )
  this.velocity += a;
  this.position += this.velocity;

  // Deacceleartion
  this.velocity *= this.deacceleration;

  if(Math.abs(this.position - this.equilibriumPosition) < 0.001 && Math.abs(this.velocity) < 0.001) {
    this.equilibrium = true;
  }
};

snabbtjs.SpringEasing.prototype.value = function() {
  return this.position;
};

snabbtjs.SpringEasing.prototype.completed = function() {
  return this.equilibrium;
};

snabbtjs.EASING_FUNCS = {
  'linear': snabbtjs.linearEasing,
  'ease': snabbtjs.ease,
  'easeIn': snabbtjs.easeIn,
  'easeOut': snabbtjs.easeOut,
};

snabbtjs.Easer = function(easer) {
  this.easer = easer;
  this._value = 0;
};

snabbtjs.Easer.prototype.tick = function(value) {
  this._value = this.easer(value);
  this.lastValue = value;
};

snabbtjs.Easer.prototype.value = function() {
  return this._value;
};

snabbtjs.Easer.prototype.completed = function() {
  return this.lastValue >= 1;
};

snabbtjs.createEaser = function(easerName, options) {
  if(easerName == 'spring') {
    return new snabbtjs.SpringEasing(options);
  }
  var easeFunction;
  if(snabbtjs.isFunction(easerName)) {
    easeFunction = easerName;
  } else {
    easeFunction = snabbtjs.EASING_FUNCS[easerName];
  }
  return new snabbtjs.Easer(easeFunction);
};
