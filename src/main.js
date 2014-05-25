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

  if(options[prefix + '_pos']) {
    p.x = options[prefix + '_pos'][0];
    p.y = options[prefix + '_pos'][1];
    p.z = options[prefix + '_pos'][2];
  }
  if(options[prefix + '_rot']) {
    p.ax =  options[prefix + '_rot'][0];
    p.ay =  options[prefix + '_rot'][1];
    p.az =  options[prefix + '_rot'][2];
  }
  if(options[prefix + '_rot_post']) {
    p.bx =  options[prefix + '_rot_post'][0];
    p.by =  options[prefix + '_rot_post'][1];
    p.bz =  options[prefix + '_rot_post'][2];
  }
  return p;
}


function snabbt(e, options) {
  var start = new Position({});
  start = pos_from_options(start, options, 'start');
  var end = new Position({});
  end = pos_from_options(end, options, 'end');

  var anim_options = {
    start_pos: start,
    end_pos: end,
    duration: options.duration || 1000,
    delay: options.delay || 0,
    offset: options.offset
  };
  if(options.easing) {
    anim_options.easing = EASING_FUNCS[options.easing];
  }
  var animation = new Animation(anim_options);

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
      var end_transform = animation.end_position();
      set_css_transform(e, end_transform.as_matrix());

      if(options.loop > 1) {
        options.loop -= 1;
        animation = new Animation(anim_options);
        requestAnimFrame(tick);
      } else {
        if(options.callback) {
          options.callback();
        }
        if(queue.length) {
          options = queue.pop();


          start = pos_from_options(end, options, 'start');
          end = pos_from_options(new Position({}), options, 'end');
          animation = new Animation({
            start_pos: start,
            end_pos: end,
            duration: options.duration || 1000,
            delay: options.delay || 0,
            offset: options.offset
          });
          if(options.easing)
            animation.easing = EASING_FUNCS[options.easing];
          //window.requestAnimationFrame(tick);
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



