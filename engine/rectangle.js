function Rectangle(/*Number*/x, /*Number*/y, /*Number*/width, /*Number*/height){
  this.left = x;
  this.top = y;
  this.right = x+width;
  this.bottom = y+height;
  this.width = width;
  this.height = height;
}

Rectangle.prototype.intersects = function(/*Rect*/other){
  return !(this.left > other.right ||
           this.right < other.left ||
           this.top > other.bottom ||
           this.bottom < other.top);
}

Rectangle.prototype.circleIntersects = function(/*Number*/centreY, /*Number*/centreX, /*Number*/radius){
  //Is the centre inside the rectangle?
  if(this.intersects(new Rectangle(centreX, centreY, 0, 0))) return true;
  var o = {x : centreX, y: centreY};
  var tl = {x : this.left, y: this.top};
  var bl = {x : this.left, y: this.bottom};
  var tr = {x : this.right, y: this.top};
  var br = {x : this.right, y: this.bottom};
  if(distToSegment(o, tl, bl) < radius) return true;
  if(distToSegment(o, br, bl) < radius) return true;
  if(distToSegment(o, br, tr) < radius) return true;
  if(distToSegment(o, tl, tr) < radius) return true;
  return false;
}

function sqr(x) { 
  return x * x; 
}
function dist2(v, w) {
  return sqr(v.x - w.x) + sqr(v.y - w.y) 
}
function distToSegmentSquared(p, v, w) {
  var l2 = dist2(v, w);
  if (l2 == 0) return dist2(p, v);
  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  if (t < 0) return dist2(p, v);
  if (t > 1) return dist2(p, w);
  return dist2(p, { x: v.x + t * (w.x - v.x),
                    y: v.y + t * (w.y - v.y) });
}
function distToSegment(p, v, w) {
  return Math.sqrt(distToSegmentSquared(p, v, w)); 
}

Rectangle.prototype.toString = function(){
  return "Rectangle{"+this.left+","+this.top+","+this.right+","+this.bottom+"}";
}

exports.Rectangle = Rectangle;