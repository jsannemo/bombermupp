function Rect(/*Number*/x, /*Number*/y, /*Number*/width, /*Number*/height){
  this.left = x;
  this.top = y;
  this.right = x+width;
  this.bottom = y+height;
  this.width = width;
  this.height = height;
}

Rect.prototype.intersects = function(/*Rect*/other){
  return !(this.left > other.right ||
           this.right < other.left ||
           this.top > other.bottom ||
           this.bottom < other.top);
}

Rect.prototype.str = function(){
  return "{"+this.left+","+this.top+","+this.right+","+this.bottom+"}";
}