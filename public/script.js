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
  var createdPalette = $('.hex').find('.lock-active').length;
  if (event.keyCode === 32 && !createdPalette) {
    while (number < 5) {
      var rgbColor = new Color();
      var hexCode = rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b);
      prependHex(hexCode, number);
      number++;
    }
  } else if (event.keyCode === 32 && createdPalette) {
    var changeShirts = $('.hex')
      .find('div')
      .filter(':not(.lock-active)');

    changeShirts.closest('section').remove();

    Object.keys(colorTracker).forEach(number => {
      if (!colorTracker[number]) {
        var rgbColor = new Color();
        var hexCode = rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b);
        prependHex(hexCode, number);
  }
    });
}
  var saveButton = $('<i>', {
    class: 'fas fa-cloud-download-alt',
    text: 'save'
  });

  $('.hex').prepend(saveButton);
}

function rgbToHex(r, g, b) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

$('window').ready(getProjects);

function getProjects() {
  // $.ajax;
  //fetch('/api/v1/projects').then(response)
}
