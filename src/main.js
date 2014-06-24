var tick_requests = [];

function requestAnimFrame(func) {
  tick_requests.push(func);
}

function master_tick(time) {
  var length = tick_requests.length;
  for(var i=0;i<length;++i) {
    tick_requests[i](time);
  }
  tick_requests.splice(0, length);
  window.requestAnimationFrame(master_tick);
}

window.requestAnimationFrame(master_tick);

function pos_from_options(p, options, prefix) {

  if(options[prefix + 'pos']) {
    p.x = options[prefix + 'pos'][0];
    p.y = options[prefix + 'pos'][1];
    p.z = options[prefix + 'pos'][2];
  }
  if(options[prefix + 'rot']) {
    p.ax =  options[prefix + 'rot'][0];
    p.ay =  options[prefix + 'rot'][1];
    p.az =  options[prefix + 'rot'][2];
  }
  if(options[prefix + 'rot_post']) {
    p.bx =  options[prefix + 'rot_post'][0];
    p.by =  options[prefix + 'rot_post'][1];
    p.bz =  options[prefix + 'rot_post'][2];
  }
  return p;
}


function snabbt(e, options) {
  var start = new snabbtjs.Position({});
  start = pos_from_options(start, options, 'from_');
  var end = new snabbtjs.Position({});
  end = pos_from_options(end, options, '');

  var anim_options = {
    start_pos: start,
    end_pos: end,
    duration: options.duration || 1000,
    delay: options.delay || 0,
    offset: options.offset
  };
  if(options.easing)
    anim_options.easing = snabbtjs.EASING_FUNCS[options.easing];
  var animation = new snabbtjs.Animation(anim_options);

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
    snabbtjs.set_css_transform(e, current_transform.as_matrix());

    if(animation.completed()) {
      var end_transform = animation.end_position();
      snabbtjs.set_css_transform(e, end_transform.as_matrix());

      if(options.loop > 1) {
        options.loop -= 1;
        animation.assign(anim_options);
        requestAnimFrame(tick);
      } else {
        if(options.callback) {
          options.callback();
        }
        if(queue.length) {
          options = queue.pop();

          start = pos_from_options(end, options, 'from_');
          end = pos_from_options(new snabbtjs.Position({}), options, '');
          animation.assign({
            start_pos: start,
            end_pos: end,
            duration: options.duration || 1000,
            delay: options.delay || 0,
            offset: options.offset
          });
          if(options.easing)
            animation.easing = snabbtjs.EASING_FUNCS[options.easing];

          animation.tick(time);
          requestAnimFrame(tick);
        }
      }
    } else {
      requestAnimFrame(tick);
    }
  }

  requestAnimFrame(tick);
  return chainer;
}



