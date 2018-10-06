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
//fetch palettes and projects on page load
$('document').ready(() => {
  //fetch request
  fetch('/api/v1/projects')
    //json the response
    .then(response => response.json())
    //with the array result, loop through
    .then(result => {
      result.forEach(project => {
        // update global colorTracker variable
        colorTracker.projects[project.title] = project.id;
        // template literal for html
        var projectHTML = `
          <div class="projects-palette projects-palette-show">
            <span class="project-name ${project.title}">${project.title}</span>
            <i class="fas fa-chevron-down down"/>
            <section class="palettes"/>
          </div>
        `;
        //append to html
        $('.projects').append(projectHTML);
        //make fetch call for respective project
        getPalettes(project.id);
      });
    });
});

function getPalettes(id) {
  //fetching projects that have the id of the palette
  fetch(`/api/v1/palettes/${id}/projects`)
    .then(response => response.json())
    .then(result => {
      //loop through the result
      result.forEach(palette => {
        // check if the id key already exists in the global variable
        if (!colorTracker.palettes[palette.project_id]) {
          //add key and set its value to the resulting array obj
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
          // if key does exist push to existing array of obj
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

//event listener for keydown of spacebar
$(document).on('keydown', handleKeyDown);

function handleKeyDown(event) {
  event.preventDefault();
  var number = 0;
  //checking if there are any existing colors that are locked
  var createdPalette = $('.hex').find('.lock-active').length;
  //checking if either polo or palette fields have focus
  var poloFocus = $('.polo-name').is(':focus');
  var paletteFocus = $('.palette-name').is(':focus');

  //spacebar is the key pressed, there are no locked colors, neither polo or palettes are on focus
  if (event.keyCode === 32 && !createdPalette && !poloFocus && !paletteFocus) {
    // a while loop runs to generate 5 new colors
    while (number < 5) {
      //instantiating a color object
      var rgbColor = new Color();
      //passing to a function that converts it to hexcode
      var hexCode = rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b);
      //render to the dom
      prependHex(hexCode, number);
      //increment number to meet base case
      number++;
    }
    //if the value in the global variable is falsey
    if (!colorTracker.projectField) {
      //create a h1 element for polo name
      var poloField = $('<h1>', {
        class: 'polo-name',
        contentEditable: 'true',
        text: 'Collection Name?'
      });
      // append poloField to html element
      $('html').append(poloField);
      // if colorTracker.projectField is false
      if (!colorTracker.projectField) {
        // polo-name has focus
        $('.polo-name').focus();
        // modal effect
        $('body').addClass('body-active');
      }
      // set projectField to true
      colorTracker.projectField = true;
    }

    var saveButton = `
    <div class="save-info">
    <i class="fas fa-cloud-download-alt"></i>
    <p class="save-title">Save</p>
    </div>`;

    $('.hex').prepend(saveButton);

    // if there are locked colors then filter the colors that don't have the locked class
  } else if (
    //if key pressed is 32
    event.keyCode === 32 &&
    //if there are locked colors
    createdPalette &&
    //if neighter field has focus
    !poloFocus &&
    !paletteFocus
  ) {
    //access the div child elements of the hex that does not have the lock active class
    var changeShirts = $('.hex')
      .find('div')
      .filter(':not(.lock-active)');
    //remove the colors that are not locked
    changeShirts.closest('.color-container').remove();
    //iterate through global obj to find the corresponding indices that have a false value and pass the number to prepend function
    Object.keys(colorTracker.lockStatus).forEach(number => {
      //if the lockstatus is false
      if (!colorTracker.lockStatus[number]) {
        //create new color object, convert to hexcode, and prepend to the dom
        var rgbColor = new Color();
        var hexCode = rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b);
        prependHex(hexCode, number);
      }
    });
  }
  //accessing the palette and polo fields
  var paletteName = $('.palette-name').text();
  var poloName = $('.polo-name').text();
  //regex to filter any characters that are not letters or numbers (including caps)
  var inp = String.fromCharCode(event.keyCode);
  if (/[a-zA-Z0-9-_ ]/.test(inp)) {
    //if polo has focus
    if (poloFocus) {
      //push the letters of keypressed into the global variable array
      colorTracker.currentProject.push(event.key);
      //concat the array into a string set it to the text of the project name field

      $('.polo-name').text(colorTracker.currentProject.join(''));
    }
    //if palette has focus
    if (paletteFocus) {
      //push the letters of keypressed into the global variable array
      colorTracker.currentPalette.push(event.key);
      //concat the array into a string set it to the text of the palette name field
      $('.palette-name').text(colorTracker.currentPalette.join(''));
    }
  }
  //if key pressed in backspace
  if (event.key === 'Backspace') {
    //if polo has focus
    if (poloFocus) {
      //splice off the last item in the current project array
      colorTracker.currentProject.splice(-1, 1);
      //set the polo name text to the concatenated array
      $('.polo-name').text(colorTracker.currentProject.join(''));
    }
    //if palette has focus
    if (paletteFocus) {
      //splice off the last item in the currentpalette array
      colorTracker.currentPalette.splice(-1, 1);
      //set the palette name text to the concatenated array
      $('.palette-name').text(colorTracker.currentPalette.join(''));
    }
  }
  //if keypressed is enter
  if (event.key === 'Enter') {
    //if polo field has focus and the project field is true and the text of field is not collection name
    if (
      poloFocus &&
      colorTracker.projectField &&
      $('.polo-name').text() !== 'Collection Name?' &&
      $('.polo-name').text() !== ''
    ) {
      //make the field uneditable
      $('.polo-name').prop('contenteditable', false);
      //lose focus
      $('.polo-name').blur();
      //pass poloname to save project function to make post request
      saveProject(poloName);
      //remove the modal effect
      $('body').removeClass('body-active');
    }
    // if palette field is in focus
    if (paletteFocus && $('.palette-name').text() !== 'Polo Name?') {
      // remove the palette field
      $('.palette-name').remove();
      // revert polo field to be editable
      $('.polo-name').prop('contenteditable', true);
      // invoke saveshirts function and pass the two fields
      saveShirts(paletteName, poloName);
      //empty the project field in global store
      colorTracker.projectField = '';
      //set the polo text to an empty string
      $('.polo-name').text('');
      //remove modal effect
      $('body').removeClass('body-active');
    }
  }
}

//function that converts rgb to hexcode
function rgbToHex(r, g, b) {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

//function that sends the hexcodes for the shirts to the dom
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
  //prepend the html to the dom
  $('.hex').prepend(newColor);
}

$('.hex').on('click', '.lock-button', lockShirt);

//locking a shirt
function lockShirt() {
  //dive into the divs to see if they have a lock-active class
  var checkActive = $(this)
    .closest('div')
    .hasClass('lock-active');
  //parent div and all siblings of the lock button
  var parentClass = $(this).closest('div');
  var siblings = $(this).siblings('span');
  //if shirt does not have lock-active class
  if (!checkActive) {
    //add lock-active class
    parentClass.addClass('lock-active');
    //extract the number of the parentclass and set that value in the global store to true
    colorTracker.lockStatus[parentClass.attr('class').slice(11, 12)] = true;
    //set the text to discard
    siblings.text('discard');
    //if shirt has active class
  } else {
    //remove that class
    parentClass.removeClass('lock-active');
    //extract the number of the parentclass and set that value in the global store to false
    colorTracker.lockStatus[parentClass.attr('class').slice(11, 12)] = false;
    //set the text to keep
    siblings.text('keep');
  }
}
//on click of the download/save cloud icon fire handleSave
$('.hex').on('click', '.fa-cloud-download-alt', handleSave);

function handleSave() {
  //addclass to create modal effect
  $('body').addClass('body-active');
  //if the palette name element does not exist
  if (!$('.hex').find('.palette-name').length) {
    //creating a new h1 element and setting class, contenteditable, and text attr
    var paletteHTML = $('<h1>', {
      class: 'palette-name',
      contenteditable: 'true',
      text: 'Polo Name?'
    });
    //append the new h1 to the html element
    $('html').append(paletteHTML);
  }
  //letting the h1 render then running the focus method to give the new h1 focus
  setTimeout(function() {
    $('.palette-name').focus();
  }, 1);
}

function saveProject(projectName) {
  //obj with title and projectName
  let obj = { title: projectName };
  //variable declaration setting value to the global projects array
  const projects = colorTracker.projects;
  //if the project does not exist in the global store
  if (!projects[projectName]) {
    //make post request
    fetch('/api/v1/projects', {
      //options parameter setting method to post, body to the obj variable, and headers to
      method: 'POST',
      body: JSON.stringify(obj),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      //success block if request was resolved
      .then(response => response.json())
      .then(result => {
        colorTracker.projects[projectName] = result.id;
      })
      //catch block if request was rejected
      .catch(error => {
        throw new Error('Cannot make new project!');
      });
  }
  // creating the new project element
  var projectHTML = `
  <div class="projects-palette projects-palette-show">
  <span class="project-name ${projectName}">${projectName}</span>
  <i class="fas fa-chevron-down down"/>
  <section class="palettes"/>
  </div>
  `;
  // append new div to projects
  $('.projects').append(projectHTML);
}

function saveShirts(paletteName, poloName) {
  let colorArray = [];
  let j = 0;
  // getting all the hex-codes of the displayed palettes in a string
  var savedHexes = $('.hex')
    .find('.hex-code')
    .text();
  // looping through the string
  for (let i = 1; i < savedHexes.length; i++) {
    // checking for # to slice string into individual hex codes strings
    if (savedHexes[i] === '#') {
      // pushing sliced string into the colorArray
      colorArray.push(savedHexes.slice(j, i));
      j = i;
    }
  }
  // push the last hexcode into array
  colorArray.push(savedHexes.slice(savedHexes.lastIndexOf('#')));
  // invoke postShirts fn and pass colorArray, the palettes name, and polo name
  postShirts(colorArray, paletteName, poloName);
  // remove palette name element
  $('.hex')
    .find('.palette-name')
    .remove();
  colorTracker.currentPalette = [];
}

function postShirts(arr, paletteName, poloName) {
  // reduce the passed down array into an obj for the body of post request
  const paletteParams = arr.reduce((bodyObj, color, index) => {
    //array to replace number with the respective string
    const numberWords = ['one', 'two', 'three', 'four', 'five'];
    //setting keys and their values to the object
    bodyObj['project_id'] = colorTracker.projects[poloName];
    bodyObj['title'] = paletteName;
    bodyObj[`color_${numberWords[index]}`] = color;
    return bodyObj;
  }, {});
  // checking if the id of the global palettes is not an empty object or if the global palette title matches the palette title of the reduced object (ensures no duplicates)
  if (
    colorTracker.palettes[paletteParams.project_id] !== {} ||
    !colorTracker.palettes[paletteParams.project_id].find(
      palette => palette.title === paletteParams.title
    )
  ) {
    // creating the options obj to be passed as second argument of the fetch call
    const options = {
      method: 'POST',
      body: JSON.stringify(paletteParams),
      headers: {
        'Content-Type': 'application/json'
      }
    };
    //fetch request to palettes
    fetch('/api/v1/palettes', options)
      //success block if request was resolved
      .then(response => response.json())
      //using the result to store to the global variable
      .then(result => {
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
      })
      //catch block if request is rejected
      .catch(error => {
        throw new Error(error);
      });
  }
}
// on mouse enter of down arrow or mouse leave of palettes container fire handleProjectClick
$('body').on('mouseenter', '.down', handleProjectClick);
$('body').on('mouseleave', '.palettes', handleProjectClick);

function handleProjectClick(event) {
  event.preventDefault();
  // text of the siblings of clicked event
  var projectName = $(this)
    .siblings('span')
    .text();
  //declaring new variable setting its value to the global projects object property
  const projectID = colorTracker.projects[projectName];
  // if clicked target is down arrow
  if ($(this).hasClass('down')) {
    //remove the class of target
    $(this).removeClass('fas fa-chevron-down down');
    // add the class of up arrow to the target
    $(this).addClass('fas fa-chevron-up up');
    // if the key of projectID exists in the global palettes obj
    if (colorTracker.palettes[projectID]) {
      //iterate through the value of existing property
      colorTracker.palettes[projectID].forEach((palette, index) => {
        //template literal for each palette element to be rendered
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
        // append the palette div to palettes container
        $(this)
          .next('.palettes')
          .append(paletteHTML);
      });
    }
    // if class is an up arrow
  } else {
    // remove the up arrow class to the i element
    $(this)
      .siblings('i')
      .removeClass('.fas fa-chevron-up up');
    $(this)
      // add the down arrow class to the i element
      .siblings('i')
      .addClass('.fas fa-chevron-down down');
    // empty the field
    $(this).empty();
  }
}
// on click of the mini palettes container fire handlePaletteClick
$('body').on('click', '.mini-palettes', handlePaletteClick);

function handlePaletteClick(event) {
  event.preventDefault();
  // text of the h4 child element of the mini-palette container
  let colors = $(this)
    .find('h4')
    .text();
  // text of the project name that is a sibling of the target
  let projectName = $(this)
    .parents('.projects-palette-show')
    .children('.project-name')
    .text();
  // getting the projectID from the global projects obj
  const projectID = colorTracker.projects[projectName];
  // matching the palette to the corresponding colors object in the global palettes obj
  const matchingPalette = colorTracker.palettes[projectID].find(
    pallete => pallete.title === colors
  );

  //iterate through keys of the matching palette
  Object.keys(matchingPalette)
    //filter the keys that have the color string
    .filter(key => key.includes('color'))
    //iterating through matching keys
    .forEach((key, index) => {
      //pass the hexcode and index to prependHex to prepend to container
      prependHex(matchingPalette[key], index);
    });
}
// on click of the close icon fire removePalette
$('body').on('click', '.fa-window-close', removePalette);

function removePalette() {
  //text of the project name
  const projectName = $(this)
    //finding parent class
    .parents('.projects-palette-show')
    //finding the children of the found parent class
    .children('.project-name')
    .text();
  // text of the palette name
  const targetPalette = $(this)
    //finding parent class
    .closest('.title-remove')
    //finding corresponding class of the found parent class
    .find('.mini-palette-title')
    .text();

  const projectID = colorTracker.projects[projectName];
  // finding the matching palette
  const matchingPalette = colorTracker.palettes[projectID].find(
    palette => palette[targetPalette]
  );
  // filtering out the pallete from the global store
  const filteredPalletes = colorTracker.palettes[projectID].filter(
    palette => palette.title !== targetPalette
  );

  colorTracker.palettes[projectID] = filteredPalletes;
  // delete request for palettes matching id
  fetch(`/api/v1/palettes/${matchingPalette.id}`, {
    method: 'DELETE'
  })
    // success block if request was resolved
    .then(response => response.json())
    // catch block if request was rejected
    .then(result => {})
    .catch(error => {
      throw new Error('Can not Delete');
    });
  // find the mini-palettes element and remove child elements
  $(this)
    .closest('.mini-palettes')
    .empty();
}
// on click of the hamburger or up arrow, fire showProjects
$('body').on('click', '.fa-bars, .fa-sort-up', showProjects);

function showProjects() {
  // checking if the clicked icon has the hamburger class
  if ($(this).hasClass('fa-bars')) {
    // toggling the class of the hamburger button
    $(this).removeClass('fa-bars');
    // switching the class to the up arrow
    $(this).addClass('fa-sort-up');
    // if the clicked icon does not have the hamburger class
  } else {
    // toggle the class of up arrow icon
    $(this).removeClass('fa-sort-up');
    // switching the class to the hamburger
    $(this).addClass('fa-bars');
  }
  // if the content div has the corresponding class  ("projects-palette" has a display: none)
  $('.projects-palette-show').hasClass('projects-palette')
    ? // remove the class
      $('.projects-palette-show').removeClass('projects-palette')
    : //add the class
      $('.projects-palette-show').addClass('projects-palette');
}
