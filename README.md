snabbt.js
========
Arbitrary DOM animations. (WIP)
[Demo](http://diggidanne.github.io/snabbt.js/)


Basic usage
-----------

	snabbt(e, {
	  pos: [100, 0, 0],
	  from_rot: [Math.PI, 0, 0],
	  rot: [2*Math.PI, 0, 0],
	  duration: 700,
	});


Chaining animations
-------------------

    snabbt(e, {
	  pos: [100, 0, 0],
	  duration: 200,
	  easing: 'cos',
	}).then({
	  pos: [100, 100, 0],
	  rot: [0, 0, 0],
	  duration: 1000,
	});

Easing functions
----------------
The following easing function are present:

 - 'linear'
 - 'cubic'
 - 'atan'
 - 'cos'
 - 'sinc_wobbler'


Options
-------
T.B.D

Under the hood
--------------
matrix3d and requestAnimationFrame so performance seems to be decent.
