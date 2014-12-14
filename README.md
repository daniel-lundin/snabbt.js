snabbt.js
========
Fast animations with Javascript(Work in progress)

- [Demo](http://daniel-lundin.github.io/snabbt.js/)
- [Stress test](http://daniel-lundin.github.io/snabbt.js/sticks.html)
- [Stress test (mobile)] (http://daniel-lundin.github.io/snabbt.js/sticks_mobile.html)

Basic usage
-----------
	snabbt(element, {
	  position: [100, 0, 0],
	  from_rotation: [-Math.PI, 0, 0],
	  duration: 700,
	});


Chaining animations
-------------------
Animation can be chained by using the `then()`-method on the returned animation object. all from_xxx properties will be set to the end state of the previous animation.

	snabbt(element, {
	  position: [100, 0, 0],
	  duration: 500,
	  easing: 'cos',
	}).then({
	  position: [100, 100, 0],
	  from_rotation: [0, 0, -Math.PI],
	  rotation: [0, 0, Math.PI],
	  duration: 1000,
	  delay: 500,
	  callback: function() { console.log('animation done'); }
	});


Options
-------

- `from_position`: Start position ([x, y, z])
- `position`: End position
- `from_rotation`: Start rotation ([a, b, c])
- `rotation`: End rotation
- `from_scale`: Start scale ([x, y])
- `scale`: End scale
- `from_rotation_post`: Start rotation applied after `position` and `rotation` ([a, b, c])
- `rotation_post`: End rotation applied after `position` and `rotation`
- `from_width`: Start width in pixels (single value)
- `width`: End width in pixels
- `from_height`: Start height in pixels (single value)
- `height`: End height in pixels
- `duration`: Animation duration in ms.
- `delay`: Delay before the animation is started in ms.
- `easing`: Easing function.
- `loop`: Repeat animation. Use Infinity for infinite looping.
- `callback`: Function to be called when the animation is completed


Easing functions
----------------
The following easing function are present:

 - 'linear'
 - 'cos'
 - 'cos'
 - 'atan'
 - 'sinc_wobbler'
 - 'linear'
 - 'square'
 - 'sqrt'
 - 'cos'
 - 'exp_cos_bounce'
 - 'exp_cos'
 - 'sinc_wobbler'


Under the hood
--------------
All animations are calculated with matrix multiplications and then set via matrix3d transforms.
