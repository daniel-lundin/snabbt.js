var snabbtjs = snabbtjs || {};

/* Entry point, only function to be called by user */
snabbtjs.snabbt = function(arg1, arg2, arg3) {
  if(arg1 === 'scroll')
    return snabbtjs.setup_scroll_animation(arg2);

  var elements = arg1;
  if(elements.hasOwnProperty('length')) {
    var queue = [];
    var aggregate_chainer = {
      chainers: [],
      then: function(opts) {
        for(var j=0;j<this.chainers.length;++j) {
          this.chainers[j].then(opts);
        }
        return aggregate_chainer;
      }
    };

    for(var i=0;i<elements.length;++i) {
      aggregate_chainer.chainers.push(snabbtjs._snabbt(elements[i], arg2, arg3));
    }
    return aggregate_chainer;
  } else {
    return snabbtjs._snabbt(elements, arg2, arg3);
  }
};

snabbtjs._snabbt = function(arg1, arg2, arg3) {
  if(arg2 === 'attention')
    return snabbtjs.setup_attention_animation(arg1, arg3);
  if(arg2 === 'stop')
    return snabbtjs.stop_animation(arg1);
  var element = arg1;
  var options = arg2;

  // Remove orphaned end states
  snabbtjs.clear_ophaned_end_states();

  // If there is a running or past completed animation with element, use that end state
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
};

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
  options.movement = movement;
  var animation = new snabbtjs.AttentionAnimation(options);

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

snabbtjs._current_animation_transform = function(animation_list, element) {
  for(var i=0;i<animation_list.length;++i) {
    var animated_element = animation_list[i][0];
    var animation = animation_list[i][1];

    if(animated_element === element) {
      state = animation.current_state();
      animation.stop();
      return state;
    }
  }
};

snabbtjs.current_animation_transform = function(element) {
  var state = snabbtjs._current_animation_transform(snabbtjs.running_animations, element);
  if(state)
    return state;

  // Check if a completed animation is stored for this element
  state = snabbtjs._current_animation_transform(snabbtjs.completed_animations, element);
};

snabbtjs.state_from_options = function(p, options, prefix) {
  if(!p)
    p = new snabbtjs.State({});

  if(options[prefix + 'position']) {
    p.x = options[prefix + 'position'][0];
    p.y = options[prefix + 'position'][1];
    p.z = options[prefix + 'position'][2];
  }
  if(options[prefix + 'rotation']) {
    p.ax =  options[prefix + 'rotation'][0];
    p.ay =  options[prefix + 'rotation'][1];
    p.az =  options[prefix + 'rotation'][2];
  }
  if(options[prefix + 'skew']) {
    p.skew_x =  options[prefix + 'skew'][0];
    p.skew_y =  options[prefix + 'skew'][1];
  }
  if(options[prefix + 'rotation_post']) {
    p.bx =  options[prefix + 'rotation_post'][0];
    p.by =  options[prefix + 'rotation_post'][1];
    p.bz =  options[prefix + 'rotation_post'][2];
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
snabbtjs.completed_animations = [];

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

  var completed_animations = snabbtjs.running_animations.filter(function(animation) {
    return animation[1].completed();
  });

  // See if there are any previously completed animations on the same element, if so, remove it before merging
  snabbtjs.completed_animations = snabbtjs.completed_animations.filter(function(animation) {
    for(var i=0;i<completed_animations.length;++i) {
      if(animation[0] === completed_animations[i][0]) {
        return false;
      }
    }
    return true;
  });

  snabbtjs.completed_animations = snabbtjs.completed_animations.concat(completed_animations);

  snabbtjs.running_animations = snabbtjs.running_animations.filter(function(animation) {
    return !animation[1].completed();
  });
};

snabbtjs.clear_ophaned_end_states = function() {
  snabbtjs.completed_animations = snabbtjs.completed_animations.filter(function(animation) {
    return (snabbtjs.find_ultimate_ancestor(animation[0]).body);
  });
};

snabbtjs.find_ultimate_ancestor = function(node) {
   var ancestor = node;
   while(ancestor.parentNode) {
      ancestor = ancestor.parentNode;
   }
   return ancestor;
};

window.requestAnimationFrame(snabbtjs.tick_animations);
