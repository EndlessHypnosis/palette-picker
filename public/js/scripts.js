$(document).ready(function () {
  genNewPalette();
  getProjects();
  getPalettes();
});

const getProjects = () => {
  const dropDownList = $('#select-project-list');

  fetch('/api/v1/projects')
  .then(result => result.json())
  .then(projects => {
    dropDownList.children().remove();

    if (projects.length === 0) {
      dropDownList.append($('<option>', {
        value: 'INVALID',
        text: '< Create New Project >'
      }));
    }

    projects.forEach(project => {
      dropDownList.append($('<option>', {
        value: project.id,
        text: project.name
      }));
    });
  });
};

const getPalettes = () => {
  let containerForPalettes = $('#container-for-projects');

  fetch('/api/v1/palettes')
  .then(result => result.json())
  .then(palettes => {
    containerForPalettes.empty();
    let divBuilder;

    if (palettes.length === 0) {
      divBuilder = $("<div>", { id: "div-palettes-none", "class": "header-med" });
      divBuilder.text('There are no saved palettes.');
      containerForPalettes.append(divBuilder);
    } else {
      let projectNameList = palettes.reduce((acum, palette) => {
        if (!acum.includes(palette.project_name)) {
          acum.push(palette.project_name);
        }
        return acum;
      }, []);
      
      projectNameList.forEach(project => {

        let projectContainer = $("<div>", { id: `${project.replace(/ /g, '')}`, "class": "div-project-container card-skinny card-skinny-span" });
        let projectHeader = $(`<h2>Saved Palettes for Project: ${project}</h2>`);
        projectContainer.append(projectHeader);
        let masterPaletteContainer = $("<div>", { "class": "main-palette-container" });
        let filteredPalettes = palettes.filter(palette => palette.project_name === project);

        filteredPalettes.forEach(palette => {
          let paletteContainer = $("<div>", { id: `${palette.id}-${palette.name.replace(/ /g, '')}`, "class": "div-palette-container" });
          paletteContainer.click((event) => {
            // only swap palettes if they're not deleteing the palette
            if (!$(event.target).hasClass('delete-palette')) {
              swapPalette(event, palette.swatches);
            }
          });
          
          let paletteHeader = $(`<h3>${palette.name}</h3>`);
          paletteContainer.append(paletteHeader);

          let deleteBtn = $(`<i id=${palette.id} class="icon ion-trash-a delete-palette"></i>`);
          deleteBtn.click((event) => {
            deletePalette(event, palette.id);
          });
          paletteContainer.append(deleteBtn);
          let swatchContainer = $("<div>", { "class": "swatch-container" });
  
          palette.swatches.forEach(swatch => {
            let swatchDiv = $(`<div class='saved-swatch'>${swatch}</div>`);
            swatchDiv.css('background-color', swatch);
            swatchContainer.append(swatchDiv);
          })
          paletteContainer.append(swatchContainer);
          masterPaletteContainer.append(paletteContainer);
        })
        projectContainer.append(masterPaletteContainer);
        containerForPalettes.append(projectContainer);
      });
    }
  });
};


const deletePalette = (event, paletteId) => {
  fetch(`/api/v1/palettes/${paletteId}`, {
    method: 'delete',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      // Let's reload the palettes to clear the deleted one
      getPalettes();
    })
    .catch(error => console.log('Error Saving Palette:', error));
};


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
};

const swapPalette = (event, swatchesList) => {
  let lockIcon;
  swatchesList.forEach((swatch, index) => {
    index++;
    // don't set swatch if locked
    lockIcon = $(`#icon-color${index}-lock`);
    if (lockIcon.hasClass('ion-unlocked')) {
      $(`#div-color${index}`).css('background-color', swatch);
      $(`#lbl-color${index}-hex`).text(swatch);
    }
  });
};


const buildSwatchesArray = () => {
  let swatchesArray = [];
  for (let i = 1; i < 6; i++) {
    swatchesArray.push($(`#lbl-color${i}-hex`).text());
  }
  return swatchesArray;
};


const savePalette = (e) => {
  const newPaletteName = $('#input-save-palette').val();
  const selectedProjectId = $('#select-project-list').find(":selected").val();

  if (selectedProjectId !== 'INVALID') {
    fetch('/api/v1/palettes', {
      method: 'post',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(
        { paletteName: newPaletteName, 
          projectLink: selectedProjectId,
          swatchesList: buildSwatchesArray()
        }
      )
    })
    .then(data => {
      getPalettes();
      // clear input
      $('#input-save-palette').val('');
    })
    .catch(error => console.log('Error Saving Palette:', error));
  } else {
    alert('Please create a project before saving a palette');
  }
};


const createProject = (e) => {
  const newProjectName = $('#input-create-project').val();
  
  fetch('/api/v1/projects', {
    method: 'post',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ projectName: newProjectName})
  })
  .then(data => data.json())
  .then(response => {
    if (response.status == 201) {
      // refresh dropdown
      getProjects();
      // clear input
      $('#input-create-project').val('');
    }
    if (response.status == 409) {
      alert(response.error);
    }
  })
  .catch(error => console.log('Error Creating Project', error));
};


const LockUnlock = (e) => {
  const targetDiv = $(e.currentTarget);
  const targetIcon = $(`#${targetDiv.data('icon')}`);

  if (targetIcon.hasClass('ion-unlocked')) {
    targetIcon
      .removeClass('ion-unlocked lock-green')
      .addClass('ion-locked lock-red');
  } else {
    targetIcon
    .removeClass('ion-locked lock-red')
    .addClass('ion-unlocked lock-green');
  }
};

// Event Listeners

$('#btn-gen-new-palette').on('click', genNewPalette);

$('#formSavePalette').on('submit', e => {
  e.preventDefault();
  if ($('#input-save-palette').val().length > 0) {
    savePalette(e);
  } else {
    alert('Please enter a palette name first.');
  }
});

$('#formCreateProject').on('submit', e => {
  e.preventDefault();
  if ($('#input-create-project').val().length > 0) {
    createProject(e);
  } else {
    alert('Please enter a project name first.');
  }
});

$('.div-color-drop').on('click', (e) => {
  LockUnlock(e);
});