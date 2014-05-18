function start_from_opts(options) {
  var p = new Position({
    x: options.start_pos[0],
    y: options.start_pos[1],
    z: options.start_pos[2],
  });
  if(options.start_rot) {
    p.ax = options.start_rot[0];
    p.ay = options.start_rot[1];
    p.az = options.start_rot[2];
  }
  return p;
}

function end_from_opts(options) {
  var p = new Position({
    x: options.end_pos[0],
    y: options.end_pos[1],
    z: options.end_pos[2],
  });
  if(options.end_rot) {
    p.ax =  options.end_rot[0];
    p.ay =  options.end_rot[1];
    p.az =  options.end_rot[2];
  }
  return p;
}


function anim(e, options) {
  var start = start_from_opts(options);
  var end = end_from_opts(options);

  var animation = new Animation({
    start_pos: start,
    end_pos: end,
    duration: options.duration || 1000,
  });
  if(options.easing) {
    animation.easing = EASING_FUNCS[options.easing];
  }

  var queue = [];
  var chainer = {
    then: function(opts) {
      queue.unshift(opts);
      return chainer;
    }
  };

  function tick(time) {
    animation.tick(time);
    var current_transform = animation.current_transform();
    set_css_transform(e, current_transform.as_matrix());

    if(animation.completed()) {
      if(queue.length) {
        var next_opts = queue.pop();
        var next_start = start_from_opts(next_opts);
        var next_end = end_from_opts(next_opts);
        animation = new Animation({
          start_pos: next_start,
          end_pos: next_end,
          duration: next_opts.duration || 1000
        });
        if(next_opts.easing) {
          animation.easing = EASING_FUNCS[next_opts.easing];
        }
        window.requestAnimationFrame(tick);
      }
    } else {
      window.requestAnimationFrame(tick);
    }
  }

  window.requestAnimationFrame(tick);

  return chainer;
}



