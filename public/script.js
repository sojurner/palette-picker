//Constructor function for colors.
let Color = function() {
  this.r = this.randomizePalette();
  this.g = this.randomizePalette();
  this.b = this.randomizePalette();
};
//Method for constructor function creating a random number between 1-359
Color.prototype.randomizePalette = function() {
  return Math.floor(Math.random() * 359);
};
//global state object that holds the projects, palettes, and lock status
let colorTracker = {
  lockStatus: {
    0: false,
    1: false,
    2: false,
    3: false,
    4: false
  },
  currentProject: [],
  currentPalette: [],
  projectField: false,
  projects: {},
  palettes: {}
};

$('document').ready(() => {
  fetch('/api/v1/projects')
    .then(response => response.json())
    .then(result => {
      result.forEach(project => {
        colorTracker.projects[project.title] = project.id;
        var projectHTML = `
        <div class="projects-palette">
          <span class="project-name ${project.title}">${project.title}</span>
          <i class="fas fa-chevron-down down"/>
          <section class="palettes"/>
        </div>
        `;

        $('.side-bar').append(projectHTML);
        getPalettes(project.id);
      });
    });
});

function getPalettes(id) {
  fetch(`/api/v1/palettes/${id}/projects`)
    .then(response => response.json())
    .then(result => {
      result.forEach(palette => {
        if (!colorTracker.palettes[palette.project_id]) {
          colorTracker.palettes[palette.project_id] = [
            {
              [palette.title]: id,
              id: palette.id,
              title: palette.title,
              color_one: palette.color_one,
              color_two: palette.color_two,
              color_three: palette.color_three,
              color_four: palette.color_four,
              color_five: palette.color_five
            }
          ];
        } else {
          colorTracker.palettes[palette.project_id].push({
            [palette.title]: id,
            id: palette.id,
            title: palette.title,
            color_one: palette.color_one,
            color_two: palette.color_two,
            color_three: palette.color_three,
            color_four: palette.color_four,
            color_five: palette.color_five
          });
        }
      });
    });
  console.log(colorTracker);
}

//event listener for keydown of spacebar
$(document).on('keydown', handleKeyDown);

function handleKeyDown(event) {
  event.preventDefault();
  var number = 0;
  //checking if there are any existing colors that are locked
  var createdPalette = $('.hex').find('.lock-active').length;
  var poloFocus = $('.polo-name').is(':focus');
  var paletteFocus = $('.palette-name').is(':focus');

  if (event.keyCode === 32 && !createdPalette && !poloFocus && !paletteFocus) {
    //if there are none, then a while loop runs to generate 5 new colors, instantiating a color object and passing to a function that converts it to hexcode
    while (number < 5) {
      var rgbColor = new Color();
      var hexCode = rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b);
      prependHex(hexCode, number);
      number++;
    }
    if (!colorTracker.projectField) {
      var poloField = $('<h1>', {
        class: 'polo-name',
        contentEditable: 'true',
        text: 'Edit Polo Name '
      });

      $('html').append(poloField);

      if (!colorTracker.projectField) {
        $('.polo-name').focus();
        $('body').addClass('body-active');
      }
      colorTracker.projectField = true;
    }

    var saveButton = $('<i>', {
      class: 'fas fa-cloud-download-alt',
      text: 'save'
    });

    $('.hex').prepend(saveButton);

    // if there are locked colors then filter the colors that don't have the locked class
  } else if (
    event.keyCode === 32 &&
    createdPalette &&
    !poloFocus &&
    !paletteFocus
  ) {
    var changeShirts = $('.hex')
      .find('div')
      .filter(':not(.lock-active)');
    //remove the colors that are not locked
    changeShirts.closest('section').remove();
    //iterate through global obj to find the corresponding indices that have a false value and pass the number to prepend function
    Object.keys(colorTracker.lockStatus).forEach(number => {
      if (!colorTracker.lockStatus[number]) {
        var rgbColor = new Color();
        var hexCode = rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b);
        prependHex(hexCode, number);
      }
    });
  }
  var paletteName = $('.palette-name').text();
  var poloName = $('.polo-name').text();

  var inp = String.fromCharCode(event.keyCode);
  if (/[a-zA-Z0-9-_ ]/.test(inp)) {
    if (poloFocus) {
      colorTracker.currentProject.push(event.key);
      $('.polo-name').text(colorTracker.currentProject.join(''));
    } else if (paletteFocus) {
      colorTracker.currentPalette.push(event.key);
      $('.palette-name').text(colorTracker.currentPalette.join(''));
    }
  } else if (event.key === 'Backspace') {
    if (poloFocus) {
      colorTracker.currentProject.splice(-1, 1);
      $('.polo-name').text(colorTracker.currentProject.join(''));
    } else if (paletteFocus) {
      colorTracker.currentPalette.splice(-1, 1);
      $('.palette-name').text(colorTracker.currentPalette.join(''));
    }
  } else if (event.key === 'Enter') {
    if (poloFocus && colorTracker.projectField) {
      $('.polo-name').blur();
      saveProject(poloName);
      $('body').removeClass('body-active');
    } else if (paletteFocus) {
      // $(this).remove();
      $('.palette-name').remove();
      saveShirts(paletteName, poloName);
      $('body').removeClass('body-active');
    }
  }
}

//prepend a save icon

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
      <i class="fas fa-tshirt shirt-${number}" style="color:${code}">
    <p class="hex-code hex-code-${number}">${code.toUpperCase()}</p>
      </i>
    <div class="locks lock-${number}">
      <button class="lock-button" style="background-color:${code}"/>
      <span class="lock-description">keep</span>
    </div>
  </section>
  `;
  $('.hex').prepend(newColor);
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
    colorTracker.lockStatus[parentClass.attr('class').slice(11, 12)] = true;
    siblings.text('discard');
  } else {
    parentClass.removeClass('lock-active');
    colorTracker.lockStatus[parentClass.attr('class').slice(11, 12)] = false;
    siblings.text('keep');
  }
}

$('.hex').on('click', '.fa-cloud-download-alt', handleSave);

function handleSave() {
  $('body').addClass('body-active');

  if (!$('.hex').find('.palette-name').length) {
    var paletteHTML = $('<h1>', {
      class: 'palette-name',
      contenteditable: 'true',
      text: 'Collection Name?'
    });
    $('html').append(paletteHTML);
  }
  setTimeout(function() {
    $('.palette-name').focus();
  }, 1);
}

function saveProject(projectName) {
  let obj = { title: projectName };
  const projects = colorTracker.projects;
  if (!projects[projectName]) {
    fetch('/api/v1/projects', {
      method: 'POST',
      body: JSON.stringify(obj),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(result => {
        colorTracker.projects[projectName] = result.id;
      });
  }
}

function saveShirts(paletteName, poloName) {
  let colorArray = [];
  let j = 0;
  var savedHexes = $('.hex')
    .find('.hex-code')
    .text();
  for (let i = 1; i < savedHexes.length; i++) {
    if (savedHexes[i] === '#') {
      colorArray.push(savedHexes.slice(j, i));
      j = i;
    }
  }
  colorArray.push(savedHexes.slice(savedHexes.lastIndexOf('#')));
  postShirts(colorArray, paletteName, poloName);

  $('.hex')
    .find('.palette-name')
    .remove();
  colorTracker.currentPalette = [];
}

function postShirts(arr, paletteName, poloName) {
  const paletteParams = arr.reduce((bodyObj, color, index) => {
    const numberWords = ['one', 'two', 'three', 'four', 'five'];
    bodyObj['project_id'] = colorTracker.projects[poloName];
    bodyObj['title'] = paletteName;
    bodyObj[`color_${numberWords[index]}`] = color;
    return bodyObj;
  }, {});

  console.log(paletteParams);

  const options = {
    method: 'POST',
    body: JSON.stringify(paletteParams),
    headers: {
      'Content-Type': 'application/json'
    }
  };
  fetch('/api/v1/palettes', options)
    .then(response => response.json())
    .then(result => {});
}

$('.side-bar').on('click', '.down, .up', handleProjectClick);

function handleProjectClick(event) {
  event.preventDefault();
  var projectName = $(this)
    .siblings('span')
    .text();

  const projectID = colorTracker.projects[projectName];

  if ($(this).hasClass('down')) {
    $(this).removeClass('fas fa-chevron-down down');
    $(this).addClass('fas fa-chevron-up up');
    colorTracker.palettes[projectID].forEach((palette, index) => {
      var paletteHTML = `
  <div class="mini-palettes">
    <h4 class="mini-palette-title">${palette.title}</h4>
    <i class="fas fa-feather ${palette.color_one}" style="color:${
        palette.color_one
      }" disabled="false"/>
    <i class="fas fa-feather ${palette.color_two}" style="color:${
        palette.color_two
      }" disabled="false"/>
    <i class="fas fa-feather ${palette.color_three}" style="color:${
        palette.color_three
      }" disabled="false"/>
    <i class="fas fa-feather ${palette.color_four}" style="color:${
        palette.color_four
      }" disabled="false"/>
    <i class="fas fa-feather ${palette.color_five}" style="color:${
        palette.color_five
      }" disabled="false"/>
  </div>
  `;
      $(this)
        .next('.palettes')
        .append(paletteHTML);
    });
  } else {
    $(this).removeClass('fas fa-chevron-up up');
    $(this).addClass('fas fa-chevron-down down');
    $(this)
      .next('.palettes')
      .empty();
  }
}

$('.side-bar').on('click', '.mini-palettes', handlePaletteClick);

function handlePaletteClick(event) {
  event.preventDefault();
  let colors = $(this).children('.fa-feather');
  let x = Object.keys(colors).forEach(color => {
    console.log(colors[color]);
  });
}

$('.hex').on('focus', '.polo-name', handleFocus);

function handleFocus(event) {
  event.preventDefault();
}
