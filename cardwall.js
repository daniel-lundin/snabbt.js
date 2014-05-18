function CardWall() {
  this.elem_count = 36;
  this.elems_per_row = 6;
  this.sides = 1;
  this.expanded = false;
  //this.stepper = create_cubic_bezier_stepper(0, 0.72, 1.25, 1);
  this.stepper = sinc_wobbler_stepper;
  this.setup();
  //this.stepper = cos_wooble_stepper;
}

CardWall.prototype.setup = function() {
  // Setup centered root element
  var x = document.body.clientWidth/2;
  //var y = document.body.scrollHeight/2;
  var y = window.innerHeight/2;
  var root = document.createElement('div');
  var root_transform = trans(x, y, 0);
  set_css_transform(root, root_transform.m);

  // Create elements
  this.elems = [];
  var self = this;
  for(var i=0;i<this.sides*this.elem_count;++i) {
    var e = document.createElement('div');
    e.className = 'patch';
    root.appendChild(e);
    var pos = new Position({});
    var elem = new Element(e, pos);
    this.elems.push(elem);
    (function(binded_elem) {
      binded_elem.e.onclick = function() {
        self.toggle_expanded();
      };
    })(elem);
  }

  document.body.appendChild(root);
};


CardWall.prototype.toggle_expanded = function() {
  console.log('toggle');
  if(this.expanded)
    this.start_state();
  else
    this.cube_formation();
  this.expanded = !this.expanded;
};

CardWall.prototype.start_state = function() {
  for(var i=0;i<this.sides*this.elem_count;++i) {
    var pos = new Position({});
    var start = this.elems[i].pos;
    if(this.elems[i].animation)
      start = this.elems[i].animation.current_transform();
    this.elems[i].animation = new Animation({
      start_pos: start,
      end_pos: pos,
      stepper: cos_stepper,
      duration: 200
    });
  }
};

CardWall.prototype.cube_formation = function() {
  var width = 120;
  var rows = this.elem_count / this.elems_per_row;
  var x, y, to_pos;
  for(var i=0;i<this.elem_count;++i) {
    /*x = 40 + -(this.elems_per_row*width)/2+ (i % this.elems_per_row) * width; 
    to_pos = new Position({
      x: x, 
      y: 40 -((rows+1)/2)*width + Math.floor(i/this.elems_per_row) * width,
      z: -100,
      az: Math.PI,
      ax: 2*Math.PI
    });
    this.elems[i].animation = new Animation({
      start_pos: this.elems[i].pos,
      end_pos:to_pos,
      stepper: this.stepper,
      duration: 2000
    });*/
    var self = this;
    (function(j) {
      setTimeout(function() {
        var start = self.elems[j].pos;
        if(self.elems[j].animation)
          start = self.elems[j].animation.current_transform();

        x = 40 + -(self.elems_per_row*width)/2+ (j % self.elems_per_row) * width; 
        to_pos = new Position({
          x: x, 
          y: 40 -((rows+1)/2)*width + Math.floor(j/self.elems_per_row) * width,
          z: -100,
          az: Math.PI,
          ax: 2*Math.PI,
          //bz: Math.PI/4
        });
        self.elems[j].animation = new Animation({
          start_pos: start,
          end_pos: to_pos,
          stepper: self.stepper,
          duration: 900
          });
      }, j*50);
    })(i);

  }
  /*
  if(this.sides > 1) {
    for(i=0;i<this.elem_count;++i) {
      x = 40 + -(this.elems_per_row*width)/2+ (i % this.elems_per_row) * width; 
      to_pos = new Position({
        x: x, 
        y: 40 -((rows+1)/2)*width + Math.floor(i/this.elems_per_row) * width,
        z: 100
      });
      this.elems[i+this.elem_count].animation = new Animation(this.elems[i+this.elem_count].pos, to_pos, this.stepper);
    }
  }
  if(this.sides > 2) {
    for(i=0;i<this.elem_count;++i) {
      z = 40 + -(this.elems_per_row*width)/2+ (i % this.elems_per_row) * width; 
      to_pos = new Position({
        x: 100,
        y: 40 -((rows+1)/2)*width + Math.floor(i/this.elems_per_row) * width,
        z: z
      });
      this.elems[i+2*this.elem_count].animation = new Animation(this.elems[i+2*this.elem_count].pos, to_pos, this.stepper);
    }
  }*/
};

CardWall.prototype.tick = function(time) {
  for(var i=0;i<this.sides*this.elem_count;++i) {
    this.elems[i].tick(time);
  }
}
