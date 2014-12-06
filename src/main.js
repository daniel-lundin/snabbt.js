var snabbtjs = snabbtjs || {};

/* Entry point, only function to be called by user */
function snabbt(arg1, arg2, arg3) {
  if(arg1 == 'scroll')
    return snabbtjs.setup_scroll_animation(arg2);
  if(arg2 == 'attention')
    return snabbtjs.setup_attention_animation(arg1, arg3);
  if(arg2 == 'stop')
    return snabbtjs.stop_animation(arg1);
  var element = arg1;
  var options = arg2;


  var start = snabbtjs.current_animation_transform(element);
  if(!start)
    start = snabbtjs.state_from_options(start, options, 'from_');
  var end = new snabbtjs.State({});
  end = snabbtjs.state_from_options(end, options, '');

  var anim_options = snabbtjs.setup_animation_options(start, end, options);
  var animation = snabbtjs.create_animation(anim_options);
  snabbtjs.running_animations.push([element, animation]);

  animation.update_element(element);
  var queue = [];
  var chainer = {
    then: function(opts) {
      queue.unshift(opts);
      return chainer;
    }
  };

  function tick(time) {
    animation.tick(time);
    animation.update_element(element);
    if(animation.stopped())
      return;

    if(!animation.completed())
      return snabbtjs.requestAnimationFrame(tick);


    if(options.loop > 1 && !animation.stopped()) {
      // Loop current animation
      options.loop -= 1;
      animation = snabbtjs.create_animation(anim_options);
      snabbtjs.requestAnimationFrame(tick);
    } else {
      if(options.callback) {
        options.callback();
      }

      // Start next animation in queue
      if(queue.length) {
        options = queue.pop();

        start = snabbtjs.state_from_options(end, options, 'from_');
        end = snabbtjs.state_from_options(new snabbtjs.State({}), options, '');
        snabbtjs.setup_animation_options(start, end, options);
        animation = new snabbtjs.Animation(options);
        snabbtjs.running_animations.push([element, animation]);

        animation.tick(time);
        snabbtjs.requestAnimationFrame(tick);
      }
    }
  }

  snabbtjs.requestAnimationFrame(tick);
  return chainer;
}

snabbtjs.setup_scroll_animation = function(options) {
  var animation = new snabbtjs.ScrollAnimation(options);
  snabbtjs.running_animations.push([undefined, animation]);

  function tick(time) {
    animation.tick(time);
    if(!animation.completed()) {
      snabbtjs.requestAnimationFrame(tick);
    }
  }
  snabbtjs.requestAnimationFrame(tick);
};

snabbtjs.setup_attention_animation = function(element,  options) {
  var movement = snabbtjs.state_from_options(new snabbtjs.State({}), options, '');
  var animation = new snabbtjs.AttentionAnimation({
    movement: movement,
    spring_constant: options.spring_constant,
    deacceleration: options.deacceleration,
    initial_velocity: options.initial_velocity
  });
  snabbtjs.running_animations.push([element, animation]);
  function tick(time) {
    animation.tick(time);
    animation.update_element(element);
    if(!animation.completed()) {
      snabbtjs.requestAnimationFrame(tick);
    }
  }
  snabbtjs.requestAnimationFrame(tick);
};

snabbtjs.stop_animation = function(element) {
  for(var i=0;i<snabbtjs.running_animations.length;++i) {
    var animated_element = snabbtjs.running_animations[i][0];
    var animation = snabbtjs.running_animations[i][1];
    if(animated_element === element) {
      animation.stop();
    }
  }
};

snabbtjs.current_animation_transform = function(element) {
  for(var i=0;i<snabbtjs.running_animations.length;++i) {
    var animated_element = snabbtjs.running_animations[i][0];
    var animation = snabbtjs.running_animations[i][1];
    if(animated_element === element) {
      var state = animation.current_state();
      animation.stop();
      return state;
    }
  }
};

snabbtjs.state_from_options = function(p, options, prefix) {
  if(!p)
    p = new snabbtjs.State({});

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
  if(options[prefix + 'skew']) {
    p.skew_x =  options[prefix + 'skew'][0];
    p.skew_y =  options[prefix + 'skew'][1];
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
};

snabbtjs.setup_animation_options = function(start, end, options) {
  options.start_state = start;
  options.end_state = end;
  return options;
};

snabbtjs.tick_requests = [];
snabbtjs.running_animations = [];

snabbtjs.requestAnimationFrame = function(func) {
  snabbtjs.tick_requests.push(func);
};

snabbtjs.tick_animations = function(time) {
  var len = snabbtjs.tick_requests.length;
  for(var i=0;i<len;++i) {
    snabbtjs.tick_requests[i](time);
  }
  snabbtjs.tick_requests.splice(0, len);
  window.requestAnimationFrame(snabbtjs.tick_animations);
  snabbtjs.running_animations = snabbtjs.running_animations.filter(function(a) {
    return !a[1].completed();
  });
};

window.requestAnimationFrame(snabbtjs.tick_animations);
