

// do this once when the page loads
$(document).ready(function () {
  genNewPalette();
})



const genNewPalette = () => {
  let randomColor;
  for (let i = 1; i < 6; i++) {
    randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
    $(`#div-color${i}`).css('background-color', randomColor);
    $(`#lbl-color${i}-hex`).text(randomColor);
  }
}

const onFormSavePalette = () => {
  console.log('save palette form hit');
}

const onFormCreateProject = () => {
  console.log('create project form hit');
}

const LockUnlock = () => {
  console.log(this);
}


$('#btn-gen-new-palette').on('click', genNewPalette);


$('#formSavePalette').on('submit', e => {
  e.preventDefault();
  onFormSavePalette(e);
});

$('#formCreateProject').on('submit', e => {
  e.preventDefault();
  onFormCreateProject(e);
});

$('.div-color-drop').on('click', (e) => {
  console.log('this is what', e.currentTarget)
});



