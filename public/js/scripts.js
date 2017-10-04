

// do this once when the page loads
$(document).ready(function () {
  genNewPalette();
})



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

const onFormSavePalette = () => {
  console.log('save palette form hit');
}

const onFormCreateProject = () => {
  console.log('create project form hit');
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
  onFormSavePalette(e);
});

$('#formCreateProject').on('submit', e => {
  e.preventDefault();
  onFormCreateProject(e);
});

$('.div-color-drop').on('click', (e) => {
  LockUnlock(e);
});



