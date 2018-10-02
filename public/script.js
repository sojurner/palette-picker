var Color = function() {
  this.rgb1 = this.randomizePalette();
  this.rgb2 = this.randomizePalette();
  this.rgb3 = this.randomizePalette();
};

Color.prototype.randomizePalette = function() {
  return Math.floor(Math.random() * 359);
};

$('.save').on('click', text);

function text(event) {
  event.preventDefault();
}

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
