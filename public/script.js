var Color = function() {
  this.r = this.randomizePalette();
  this.g = this.randomizePalette();
  this.b = this.randomizePalette();
};

Color.prototype.randomizePalette = function() {
  return Math.floor(Math.random() * 359);
};
let colorTracker = {
  0: false,
  1: false,
  2: false,
  3: false,
  4: false
};
$(document).on('keydown', handleKeyDown);

function handleKeyDown(event) {
  event.preventDefault();
  var number = 0;
  var colorArray = [];
  if (event.keyCode === 32) {
    while (number < 5) {
      var rgbColor = new Color();
      colorArray.push(rgbColor);
      var hex = rgbToHex(rgbColor.rgb1, rgbColor.rgb2, rgbColor.rgb3);
      return hex;
      number++;
    }
  }
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
}

function rgbToHex(r, g, b) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

$('window').ready(getProjects);

function getProjects() {
  // $.ajax;
  //fetch('/api/v1/projects').then(response)
}
