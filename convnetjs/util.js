
// contains various utility functions 
var cnnutil = (function(exports){

  // a window stores _size_ number of values
  // and returns averages. Useful for keeping running
  // track of validation or training accuracy during SGD
  var Window = function(size, minsize) {
    this.v = [];
    this.size = typeof(size)==='undefined' ? 100 : size;
    this.minsize = typeof(minsize)==='undefined' ? 20 : minsize;
    this.sum = 0;
  }
  Window.prototype = {
    add: function(x) {
      this.v.push(x);
      this.sum += x;
      if(this.v.length>this.size) {
        var xold = this.v.shift();
        this.sum -= xold;
      }
    },
    get_average: function() {
      if(this.v.length < this.minsize) return -1;
      else return this.sum/this.v.length;
    },
    reset: function(x) {
      this.v = [];
      this.sum = 0;
    }
  }

  // returns min, max and indeces of an array
  var maxmin = function(w) {
    if(w.length === 0) { return {}; } // ... ;s

    var maxv = w[0];
    var minv = w[0];
    var maxi = 0;
    var mini = 0;
    for(var i=1;i<w.length;i++) {
      if(w[i] > maxv) { maxv = w[i]; maxi = i; } 
      if(w[i] < minv) { minv = w[i]; mini = i; } 
    }
    return {maxi: maxi, maxv: maxv, mini: mini, minv: minv, dv:maxv-minv};
  }

  // returns string representation of float
  // but truncated to length of d digits
  var f2t = function(x, d) {
    if(typeof(d)==='undefined') { var d = 5; }
    var dd = 1.0 * Math.pow(10, d);
    return '' + Math.floor(x*dd)/dd;
  }

  // 2017-12-04 jack
  // a seeded pseudo random number generator
  function Random(seed) {
      this._seed = seed % 2147483647;
      if (this._seed <= 0) this._seed += 2147483646;
  }

  Random.prototype = {
      next: function() {
          return this._seed = this._seed * 16807 % 2147483647;
      },
      nextFloat: function() {
          return (this.next() - 1) / 2147483646;
      }
  }

  exports = exports || {};
  exports.Window = Window;
  exports.maxmin = maxmin;
  exports.f2t = f2t;
  exports.Random = Random;
  return exports;

})(typeof module != 'undefined' && module.exports);  // add exports to module.exports if in node.js


