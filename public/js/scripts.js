// TODO: Go through and append $ to jQuery variables
// TODO: [done] Make sure project names are checked for uniqueness
// TODO: Clear Inputs on adding project/palette
// TODO: Clicking an existing palette should load those colors into main swatches
// TODO: Need to add button to delete palette
// TODO: move server comments to own branch
// TODO: add readme
// TODO: Add notify?

// do this once when the page loads
$(document).ready(function () {
  genNewPalette();
  getProjects();
  getPalettes();
})

const getProjects = () => {
  const dropDownList = $('#select-project-list');

  fetch('/api/v1/projects')
  .then(result => result.json())
  .then(projects => {
    // console.log('THIS IS Projects:', projects)
    // let projectNames = Object.keys(projects);
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
    })

  })
}

const getPalettes = () => {
  let containerForPalettes = $('#container-for-projects');

  fetch('/api/v1/palettes')
  .then(result => result.json())
  .then(palettes => {
    console.log('what is palletes on get palettes:', palettes);
    containerForPalettes.empty();

    let divBuilder;

    if (palettes.length === 0) {

      divBuilder = $("<div>", { id: "div-palettes-none", "class": "header-med" });
      divBuilder.text('There are no saved palettes :(')
      // $div.click(function () { /* ... */ });
      containerForPalettes.append(divBuilder);
      
    } else {

      // console.log('what do pallets look like again', palettes)

      let projectNameList = palettes.reduce((acum, palette) => {

        if (!acum.includes(palette.project_name)) {
          acum.push(palette.project_name);
        }
        return acum;
      }, []);

      // console.log('what is the project list:', projectNameList);
      
      projectNameList.forEach(project => {

        let projectContainer = $("<div>", { id: `${project.replace(/ /g, '')}`, "class": "div-project-container" });
        let projectHeader = $(`<h2>${project}</h2>`);
        projectContainer.append(projectHeader);
        
        let filteredPalettes = palettes.filter(palette => palette.project_name === project)

        filteredPalettes.forEach(palette => {
          let paletteContainer = $("<div>", { id: `${palette.id}-${palette.name.replace(/ /g, '')}`, "class": "div-palette-container" });
          paletteContainer.click((event) => {
            // only swap palettes if they're not deleteing the palette
            if (!$(event.target).hasClass('delete-palette')) {
              swapPalette(event, palette.swatches);
            }

          });
          
          let paletteHeader = $(`<h2>${palette.name}</h2>`)
          paletteContainer.append(paletteHeader);

          let deleteBtn = $(`<i id=${palette.id} class="icon ion-trash-a delete-palette"></i>`);
          deleteBtn.click((event) => {
            deletePalette(event, palette.id);
          });
          paletteContainer.append(deleteBtn);
  
          palette.swatches.forEach(swatch => {
            let swatchDiv = $(`<div>${swatch}</div>`);
            swatchDiv.css('background-color', swatch)
            paletteContainer.append(swatchDiv)
          })

          // add the palette to the project container
          projectContainer.append(paletteContainer);
  
        })
        // add the project to the master container
        containerForPalettes.append(projectContainer);
      })

      
    }

  })
}



const deletePalette = (event, paletteId) => {
  console.log('delete palette with ID:', paletteId);

  fetch(`/api/v1/palettes/${paletteId}`, {
    method: 'delete',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      console.log('response from delete:', response);
      // add notify here

      // Let's reload the palettes to clear the deleted one
      getPalettes();
    })
    .catch(error => console.log('Error Saving Palette:', error))
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

const swapPalette = (event, swatchesList) => {
  console.log('EVENT:', event);
  
  let lockIcon;
  swatchesList.forEach((swatch, index) => {
    index++;
    // don't set swatch if locked
    lockIcon = $(`#icon-color${index}-lock`);

    if (lockIcon.hasClass('ion-unlocked')) {
      $(`#div-color${index}`).css('background-color', swatch);
      $(`#lbl-color${index}-hex`).text(swatch);
    }

  })
}


const buildSwatchesArray = () => {
  let swatchesArray = [];
  for (let i = 1; i < 6; i++) {
    swatchesArray.push($(`#lbl-color${i}-hex`).text());
  }
  return swatchesArray;
}




const savePalette = (e) => {
  console.log('save palette form hit', e);
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
          swatchesList: buildSwatchesArray()  // ['#fbdd13', '#3cce59', '#4538bb', '#e3501c', '#98f30b']
        }
      )
    })
    .then(data => {
      console.log('Added Palette: ', data);
      getPalettes();
      // clear input
      $('#input-save-palette').val('');
    })
    .catch(error => console.log('Error Saving Palette:', error))

  } else {
    alert('Please create a project before saving a palette');
  }


}

const createProject = (e) => {
  console.log('create project form hit', e);
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
    console.log('Created Project: ', response)
    if (response.status == 201) {
      // refresh dropdown
      getProjects();
      // clear input
      $('#input-create-project').val('');
    }

    if (response.status == 409) {
      // console.log(response.error)
      alert(response.error)
    }

  })
  .catch(error => console.log('Error Creating Project', error))
}

const LockUnlock = (e) => {
  const targetDiv = $(e.currentTarget);
  const targetIcon = $(`#${targetDiv.data('icon')}`);
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
  if ($('#input-save-palette').val().length > 0) {
    savePalette(e);
  } else {
    alert('Please enter a palette name first.')
  }
});

$('#formCreateProject').on('submit', e => {
  e.preventDefault();
  if ($('#input-create-project').val().length > 0) {
    createProject(e);
  } else {
    alert('Please enter a project name first.')
  }
});

$('.div-color-drop').on('click', (e) => {
  LockUnlock(e);
});



