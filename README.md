snabbt.js
========
Fast animations with Javascript(Work in progress)

- [Demo](http://daniel-lundin.github.io/snabbt.js/)
- [Stress test](http://daniel-lundin.github.io/snabbt.js/sticks.html)


Basic usage
-----------
	snabbt(element, {
	  pos: [100, 0, 0],
	  from_rot: [-Math.PI, 0, 0],
	  duration: 700,
	});


Chaining animations
-------------------
Animation can be chained by using the `then()`-method on the returned animation object. all from_xxx properties will be set to the end state of the previous animation.

	snabbt(element, {
	  pos: [100, 0, 0],
	  duration: 100o,
	  easing: 'cos',
	}).then({
	  pos: [100, 100, 0],
	  from_rot: [0, 0, -Math.PI],
	  rot: [0, 0, Math.PI],
	  duration: 1000,
	  delay: 500,
	  callback: function() { console.log('animation done'); }
	});


Options
-------

- `from_pos`: Start position
- `pos`: End position
- `from_rot`: Start rotation
- `rot`: End rotation
- `from_rot_post`: Start rotation applied after `pos` and `rot`
- `rot_post`: End rotation applied after `pos` and `rot`
- `duration`: Animation duration in ms.
- `delay`: Delay before the animation is started in ms.
- `easing`: Easing function.
- `loop`: Repeat animation. Use Infinity for infinite looping.
- `callback`: Function to be called when the animation is completed


Easing functions
----------------
The following easing function are present:

 - 'linear'
 - 'cubic'
 - 'atan'
 - 'cos'
 - 'sinc_wobbler'

Under the hood
--------------
All animations are calculated with matrix multiplications and then set via matrix3d transforms.
