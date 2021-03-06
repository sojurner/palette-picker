let Color = function() {
  this.r = this.randomizePalette();
  this.g = this.randomizePalette();
  this.b = this.randomizePalette();
};

Color.prototype.randomizePalette = function() {
  return Math.floor(Math.random() * 359);
};

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
          <div class="projects-palette projects-palette-show">
            <span class="project-name ${project.title}">${project.title}</span>
            <i class="fas fa-chevron-down down"/>
            <section class="palettes"/>
          </div>
        `;

        $('.projects').append(projectHTML);
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
}

$(document).on('keydown', handleKeyDown);

function handleKeyDown(event) {
  event.preventDefault();
  var number = 0;
  var createdPalette = $('.hex').find('.lock-active').length;
  var poloFocus = $('.polo-name').is(':focus');
  var paletteFocus = $('.palette-name').is(':focus');

  if (event.keyCode === 32 && !createdPalette && !poloFocus && !paletteFocus) {
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
        text: 'Collection Name?'
      });
      $('html').append(poloField);
      if (!colorTracker.projectField) {
        $('.polo-name').focus();
        $('body').addClass('body-active');
      }
      colorTracker.projectField = true;
    }

    var saveButton = `
      <div class="save-info">
        <i class="fas fa-cloud-download-alt"></i>
        <p class="save-title">Save</p>
      </div>`;

    $('.hex').prepend(saveButton);
  } else if (
    event.keyCode === 32 &&
    createdPalette &&
    !poloFocus &&
    !paletteFocus
  ) {
    var changeShirts = $('.hex')
      .find('div')
      .filter(':not(.lock-active)');
    changeShirts.closest('.color-container').remove();
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
    }
    if (paletteFocus) {
      colorTracker.currentPalette.push(event.key);
      $('.palette-name').text(colorTracker.currentPalette.join(''));
    }
  }
  if (event.key === 'Backspace') {
    if (poloFocus) {
      colorTracker.currentProject.splice(-1, 1);
      $('.polo-name').text(colorTracker.currentProject.join(''));
    }
    if (paletteFocus) {
      colorTracker.currentPalette.splice(-1, 1);
      $('.palette-name').text(colorTracker.currentPalette.join(''));
    }
  }
  if (event.key === 'Enter') {
    if (
      poloFocus &&
      colorTracker.projectField &&
      $('.polo-name').text() !== 'Collection Name?' &&
      $('.polo-name').text() !== ''
    ) {
      $('.polo-name').prop('contenteditable', false);
      $('.polo-name').blur();
      saveProject(poloName);
      $('body').removeClass('body-active');
    }
    if (paletteFocus && $('.palette-name').text() !== 'Polo Name?') {
      $('.palette-name').remove();
      $('.polo-name').prop('contenteditable', true);
      saveShirts(paletteName, poloName);
      colorTracker.currentProject = [];
      colorTracker.projectField = false;
      $('.polo-name').text('');
      $('body').removeClass('body-active');
    }
  }
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
      text: 'Polo Name?'
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
      })
      .catch(error => {
        throw new Error('Cannot make new project!');
      });
  }
  var projectHTML = `
    <div class="projects-palette projects-palette-show">
      <span class="project-name ${projectName}">${projectName}</span>
      <i class="fas fa-chevron-down down"/>
      <section class="palettes"/>
    </div>
  `;

  $('.projects').append(projectHTML);
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
  colorTracker.currentPalette = [];
  postShirts(colorArray, paletteName, poloName);

  $('.hex')
    .find('.palette-name')
    .remove();
}

function postShirts(arr, paletteName, poloName) {
  const paletteParams = arr.reduce((bodyObj, color, index) => {
    const numberWords = ['one', 'two', 'three', 'four', 'five'];
    bodyObj['project_id'] = colorTracker.projects[poloName];
    bodyObj['title'] = paletteName;
    bodyObj[`color_${numberWords[index]}`] = color;
    return bodyObj;
  }, {});

  if (
    colorTracker.palettes[paletteParams.project_id] !== {} ||
    !colorTracker.palettes[paletteParams.project_id].find(
      palette => palette.title === paletteParams.title
    )
  ) {
    const options = {
      method: 'POST',
      body: JSON.stringify(paletteParams),
      headers: {
        'Content-Type': 'application/json'
      }
    };

    fetch('/api/v1/palettes', options)
      .then(response => response.json())
      .then(result => {
        if (!colorTracker.palettes[result.project_id]) {
          colorTracker.palettes[result.project_id] = [
            {
              [result.title]: result.project_id,
              id: result.id,
              title: result.title,
              color_one: result.color_one,
              color_two: result.color_two,
              color_three: result.color_three,
              color_four: result.color_four,
              color_five: result.color_five
            }
          ];
        } else {
          colorTracker.palettes[result.project_id].push({
            [result.title]: result.project_id,
            id: result.id,
            title: result.title,
            color_one: result.color_one,
            color_two: result.color_two,
            color_three: result.color_three,
            color_four: result.color_four,
            color_five: result.color_five
          });
        }
      })
      .catch(error => {
        throw new Error(error);
      });
  }
}

$('body').on('mouseenter', '.down', handleProjectClick);
$('body').on('mouseleave', '.palettes', handleProjectClick);

function handleProjectClick(event) {
  event.preventDefault();
  var projectName = $(this)
    .siblings('span')
    .text();
  const projectID = colorTracker.projects[projectName];
  if ($(this).hasClass('down')) {
    $(this).removeClass('fas fa-chevron-down down');
    $(this).addClass('fas fa-chevron-up up');
    if (colorTracker.palettes[projectID]) {
      colorTracker.palettes[projectID].forEach((palette, index) => {
        var paletteHTML = `
          <div class="mini-palettes">
          <div class="title-remove">
            <h4 class="mini-palette-title">${palette.title}</h4>
            <i class="fas fa-window-close"/>
          </div>
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
    }
  } else {
    $(this)
      .siblings('i')
      .removeClass('.fas fa-chevron-up up');
    $(this)
      .siblings('i')
      .addClass('.fas fa-chevron-down down');
    $(this).empty();
  }
}

$('body').on('click', '.mini-palettes', handlePaletteClick);

function handlePaletteClick(event) {
  event.preventDefault();
  let colors = $(this)
    .find('h4')
    .text();
  let projectName = $(this)
    .parents('.projects-palette-show')
    .children('.project-name')
    .text();
  const projectID = colorTracker.projects[projectName];
  const matchingPalette = colorTracker.palettes[projectID].find(
    pallete => pallete.title === colors
  );

  Object.keys(matchingPalette)
    .filter(key => key.includes('color'))
    .forEach((key, index) => {
      prependHex(matchingPalette[key], index);
    });
}

$('body').on('click', '.fa-window-close', removePalette);

function removePalette() {
  const projectName = $(this)
    .parents('.projects-palette-show')
    .children('.project-name')
    .text();

  const targetPalette = $(this)
    .closest('.title-remove')
    .find('.mini-palette-title')
    .text();

  const projectID = colorTracker.projects[projectName];
  const matchingPalette = colorTracker.palettes[projectID].find(
    palette => palette[targetPalette]
  );
  const filteredPalletes = colorTracker.palettes[projectID].filter(
    palette => palette.title !== targetPalette
  );
  colorTracker.palettes[projectID] = filteredPalletes;

  fetch(`/api/v1/palettes/${matchingPalette.id}`, {
    method: 'DELETE'
  })
    .then(response => response.json())
    .then(result => {})
    .catch(error => {
      throw new Error('Can not Delete');
    });

  $(this)
    .closest('.mini-palettes')
    .empty();
}

$('body').on('click', '.fa-bars, .fa-sort-up', showProjects);

function showProjects() {
  if ($(this).hasClass('fa-bars')) {
    $(this).removeClass('fa-bars');
    $(this).addClass('fa-sort-up');
  } else {
    $(this).removeClass('fa-sort-up');
    $(this).addClass('fa-bars');
  }

  $('.projects-palette-show').hasClass('projects-palette')
    ? $('.projects-palette-show').removeClass('projects-palette')
    : $('.projects-palette-show').addClass('projects-palette');
}
