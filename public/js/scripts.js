
// let divColor1 = $('#color1');

// console.log('div1:', divColor1);


let randomColor;

// divColor1.css('background-color', randomColor)



const genNewPalette = () => {
  
  for (let i = 1; i < 6; i++) {
    randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
    $(`#div-color${i}`).css('background-color', randomColor);
    $(`#lbl-color${i}-hex`).text(randomColor);
  }
}


$('#btn-gen-new-palette').on('click', genNewPalette)

genNewPalette();

console.log('LOG THIS:', $('#lbl-color1-hex'))
// debugger;
$('#lbl-color1-hex').text('SDFSDF');