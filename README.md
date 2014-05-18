snabb.js
========
Arbitrary DOM animations. (WIP)


Basic usage
-----------

	anim(e, {
	  start_pos: [0, 0, 0],
	  end_pos: [10, 10, 10],
	  start_rot: [0, 0, 0],
	  end_rot: [0, 0, 0],
	  duration: 100,
	  easing: 'linear'
	});


Chaining animations
-------------------

    anims([e1, e2, e3], {
	  start_pos: [0, 0, 0],
	  end_pos: [10, 10, 10],
	  start_rot: [0, 0, 0],
	  end_rot: [0, 0, 0],
	  duration: 100,
	  easing: 'linear'
	}).then({
	  start_pos: [0, 0, 0],
	  end_pos: [10, 10, 10],
	  start_rot: [0, 0, 0],
	  end_rot: [0, 0, 0],
	  duration: 100,
	  easing: 'linear'
	});

Under the hood
--------------
Makes use of CSS 3D-transforms and requestAnimationFrame so performance seems to be decent.
