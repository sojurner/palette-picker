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
    //if there are none, then a while loop runs to generate 5 new colors, instantiating a color object and passing to a function that converts it to hexcode
    while (number < 5) {
      var rgbColor = new Color();
      var hexCode = rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b);
      prependHex(hexCode, number);
      number++;
    }
    // if there are locked colors then filter the colors that don't have the locked class
  } else if (event.keyCode === 32 && createdPalette) {
    var changeShirts = $('.hex')
      .find('div')
      .filter(':not(.lock-active)');
    //remove the colors that are not locked
    changeShirts.closest('section').remove();
    //iterate through global obj to find the corresponding indices that have a false value and pass the number to prepend function
    Object.keys(colorTracker).forEach(number => {
      if (!colorTracker[number]) {
        var rgbColor = new Color();
        var hexCode = rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b);
        prependHex(hexCode, number);
      }
    });
  }
  //prepend a save icon
  var saveButton = $('<i>', {
    class: 'fas fa-cloud-download-alt',
    text: 'save'
  });
  $('.hex').prepend(saveButton);
}
//function that converts rgb
function rgbToHex(r, g, b) {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
function prependHex(code, number) {
  //check if there are 5 shirt icons
  if ($('.hex').find('i.fa-tshirt').length === 5) {
    //remove all shirts
    $('.hex').empty();
  }
  //template literal to pass to prepend method to render it to our html
  var newColor = `
  <section class="color-container color-container-${number}">
    <i class="fas fa-tshirt shirt-${number}" style="color:${code}"/>
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
  var projects = ['project1', 'project2'];

  projects.forEach(project => {
    var projectHTML = `
      <div class="projects-palette">
      <span class="project-name">${project}</span>
      <i class="fas fa-chevron-down down"></i>
      <section class="palettes"></section>
      </div>
      `;
    $('.side-bar').append(projectHTML);
  });
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

$('.side-bar').on('click', '.down, .up', handleProjectClick);

function handleProjectClick(event) {
  event.preventDefault();
  let projects = [{ title: 'project1', project_id: 123 }];
  let palettes1 = [
    {
      title: 'light',
      project_id: 123,
      color_one: '#133760',
      color_two: '#6152A2',
      color_three: '#79A8D7',
      color_four: '#A8C3C8',
      color_five: '#FCE5A3'
    },
    {
      title: 'dark',
      project_id: 123,
      color_one: '#133760',
      color_two: '#6152A2',
      color_three: '#79A8D7',
      color_four: '#A8C3C8',
      color_five: '#FCE5A3'
    }
  ];

  if ($(this).hasClass('down')) {
    $(this).removeClass('fas fa-chevron-down down');
    $(this).addClass('fas fa-chevron-up up');

