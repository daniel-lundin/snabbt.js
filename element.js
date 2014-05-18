function Element(e, pos, animation_complete) {
  this.e = e;
  this.pos = pos;
  this.animation = undefined;
  this.animation_complete = animation_complete;
}

Element.prototype.tick = function(time) {
  if(this.animation) {
    if(this.animation.completed()) {
      // If animation is complete, set pos/rot to animation end state
      this.pos = this.animation.end_position();

      this.pos.ax += 2*Math.PI;
      while(this.pos.ax >= 2*Math.PI)
        this.pos.ax -= 2*Math.PI;
      this.pos.ay += 2*Math.PI;
      while(this.pos.ay >= 2*Math.PI)
        this.pos.ay -= 2*Math.PI;
      this.pos.az += 2*Math.PI;
      while(this.pos.az >= 2*Math.PI)
        this.pos.az -= 2*Math.PI;
      this.pos.bx += 2*Math.PI;
      while(this.pos.bx >= 2*Math.PI)
        this.pos.bx -= 2*Math.PI;
      this.pos.by += 2*Math.PI;
      while(this.pos.by >= 2*Math.PI)
        this.pos.by -= 2*Math.PI;
      this.pos.bz += 2*Math.PI;
      while(this.pos.bz >= 2*Math.PI)
        this.pos.bz -= 2*Math.PI;

      this.animation = undefined;
      set_css_transform(this.e, this.pos.as_matrix());
      if(this.animation_complete) {
        this.animation_complete();
      }
    } else {
      this.animation.tick(time);
      set_css_transform(this.e, this.animation.current_transform().as_matrix());
    }
  } else {
    set_css_transform(this.e, this.pos.as_matrix());
  }
};

