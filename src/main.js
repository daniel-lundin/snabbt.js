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

function state_from_options(p, options, prefix) {

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
  if(options[prefix + 'scale']) {
    p.sx =  options[prefix + 'scale'][0];
    p.sy =  options[prefix + 'scale'][1];
  }
  if(options[prefix + 'width'] !== undefined) {
    p.width =  options[prefix + 'width'];
  }
  if(options[prefix + 'height'] !== undefined) {
    p.height =  options[prefix + 'height'];
  }
  if(options[prefix + 'opacity'] !== undefined) {
    p.opacity =  options[prefix + 'opacity'];
  }
  return p;
}


function snabbt(e, options) {
  if(e == 'scroll') {
    return snabbtjs.setup_scroll_animation(options);
  }

  var start = new snabbtjs.State({});
  start = state_from_options(start, options, 'from_');
  var end = new snabbtjs.State({});
  end = state_from_options(end, options, '');

  var anim_options = {
    start_state: start,
    end_state: end,
    duration: options.duration || 1000,
    delay: options.delay || 0,
    offset: options.offset
  };
  if(options.easing)
    anim_options.easing = snabbtjs.EASING_FUNCS[options.easing];
  if(options.manual)
    anim_options.mode = snabbtjs.AnimationType.MANUAL;
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
    var current_state = animation.current_state();
    snabbtjs.set_css(e, current_state);

    if(animation.completed()) {
      var end_state = animation.end_state();
      snabbtjs.set_css(e, end_state);

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

          start = state_from_options(end, options, 'from_');
          end = state_from_options(new snabbtjs.State({}), options, '');
          animation.assign({
            start_state: start,
            end_state: end,
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
  if(options.manual) 
    return animation;
  else
    return chainer;
}

snabbtjs.setup_scroll_animation = function(options) {
  var animation = new snabbtjs.ScrollAnimation(options);

  function tick(time) {
    animation.tick(time);
    if(!animation.completed()) {
      requestAnimFrame(tick);
    }
  }
  requestAnimFrame(tick);
};

