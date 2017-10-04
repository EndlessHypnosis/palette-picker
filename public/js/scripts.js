

// do this once when the page loads
$(document).ready(function () {
  genNewPalette();
  getProjects();
})


const getProjects = () => {

  const dropDownList = $('#select-project-list')

  fetch('http://localhost:3000/api/projects')
  .then(result => result.json())
  .then(projects => {
    // console.log('THIS IS Projects:', projects)
    let projectNames = Object.keys(projects);

    dropDownList.children().remove();

    projectNames.forEach(project => {
      dropDownList.append($('<option>', {
        value: project,
        text: project
      }));
    })



  })
}

const genNewPalette = () => {
  let randomColor;
  let lockIcon;
  for (let i = 1; i < 6; i++) {

    // don't reroll for locked
    lockIcon = $(`#icon-color${i}-lock`);

    if (lockIcon.hasClass('ion-unlocked')) {
      randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
      $(`#div-color${i}`).css('background-color', randomColor);
      $(`#lbl-color${i}-hex`).text(randomColor);
    }

  }
}

const savePalette = (e) => {
  console.log('save palette form hit', e);
  const newPaletteName = $('#input-save-palette').val();

  fetch('http://localhost:3000/api/palettes', {
    method: 'post',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(
      { paletteName: newPaletteName, 
        projectLink: $('#select-project-list').find(":selected").text(),
        paletteColors: ['#fbdd13', '#3cce59', '#4538bb', '#e3501c', '#98f30b']
      }
    )
  })
  .then(data => {
    console.log('Added Palette: ', data)
  })
}

const createProject = (e) => {
  console.log('create project form hit', e);
  const newProjectName = $('#input-create-project').val();
  
  fetch('http://localhost:3000/api/projects', {
    method: 'post',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ projectName: newProjectName})
  })
  .then(data => {
    console.log('Create Project: ', data)
    // refresh dropdown
    getProjects();
  })
}

const LockUnlock = (e) => {
  const targetDiv = $(e.currentTarget);
  const targetIcon = $(`#${targetDiv.data('icon')}`)
  console.log('data-icon for this div: ', targetIcon);

  if (targetIcon.hasClass('ion-unlocked')) {
    targetIcon
      .removeClass('ion-unlocked lock-green')
      .addClass('ion-locked lock-red');
  } else {
    targetIcon
    .removeClass('ion-locked lock-red')
    .addClass('ion-unlocked lock-green');
  }
}

$('#btn-gen-new-palette').on('click', genNewPalette);


$('#formSavePalette').on('submit', e => {
  e.preventDefault();
  savePalette(e);
});

$('#formCreateProject').on('submit', e => {
  e.preventDefault();
  createProject(e);
});

$('.div-color-drop').on('click', (e) => {
  LockUnlock(e);
});



