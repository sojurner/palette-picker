//Constructor function for colors.
var Color = function() {
  this.r = this.randomizePalette();
  this.g = this.randomizePalette();
  this.b = this.randomizePalette();
};
//Method for constructor function creating a random number between 1-359
Color.prototype.randomizePalette = function() {
  return Math.floor(Math.random() * 359);
};
//Based on how I structured my code, declared a global object that tracks whether a color was locked to have access to the number so that a newly generated color would take the place of the old color
let colorTracker = {
  0: false,
  1: false,
  2: false,
  3: false,
  4: false
};
//event listener for keydown of spacebar
$(document).on('keydown', handleKeyDown);

function handleKeyDown(event) {
  event.preventDefault();
  var number = 0;
  //checking if there are any existing colors that are locked
  var createdPalette = $('.hex').find('.lock-active').length;
  if (event.keyCode === 32 && !createdPalette) {
    //if there are not then a while loop to generate 5 new colors, instantiating a color object and passing to a function that converts it to hexcode
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
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function prependHex(code, number) {
  if ($('.hex').find('i.fa-tshirt').length === 5) {
    $('.hex').empty();
  }

  var newColor = `
  <section class="color-container color-container-${number}">
    <i class="fas fa-tshirt shirt-${number}" style="color:${code}" > </i>
    <p class="hex-code hex-code-${number}">${code.toUpperCase()}</p>
    <div class="locks lock-${number}">
      <button class="lock-button" style="background-color:${code}"></button>
      <span class="lock-description">keep</span>
    </div>
  </section>
  `;
  $('.hex').prepend(newColor);
}

$('window').ready(getProjects);

function getProjects() {
  console.log('fetch to projects');
  // $.ajax;
  //fetch('/api/v1/projects').then(response)
}

$('.hex').on('click', '.lock-button', lockShirt);

function lockShirt() {
  var checkActive = $(this)
    .closest('div')
    .hasClass('lock-active');
  var parentClass = $(this).closest('div');
  var siblings = $(this).siblings('span');
  if (!checkActive) {
    parentClass.addClass('lock-active');
    colorTracker[parentClass.attr('class').slice(11, 12)] = true;
    siblings.text('discard');
  } else {
    parentClass.removeClass('lock-active');
    colorTracker[parentClass.attr('class').slice(11, 12)] = false;
    siblings.text('keep');
  }
}

$('.hex').on('click', '.fa-cloud-download-alt', saveShirts);

function saveShirts() {
  let array = [];
  let j = 0;

  var savedHexes = $('.hex')
    .find('.hex-code')
    .text();
  console.log(savedHexes);
  for (let i = 1; i < savedHexes.length; i++) {
    if (savedHexes[i] === '#') {
      array.push(savedHexes.slice(j, i));
      j = i;
    }
  }
  array.push(savedHexes.slice(savedHexes.lastIndexOf('#')));

  console.log(array);
}
