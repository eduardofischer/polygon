import "../sass/style.sass";
import { start_game } from './game.js';

// Update the player color each time it changes
document.querySelectorAll('.color').forEach(el => {
  el.addEventListener('change', () => {
    document.querySelector('#login_button').style.backgroundColor = el.value;
    document.querySelector('#colors').dataset.color = el.value;
  })
});

// Start the game when ENTER is pressed
document.querySelector('#login_box').addEventListener('keypress', event => {
  if (event.keyCode == 13)
    start_game();
})

// Start the game when join btn is clicked
document.querySelector('#login_button').addEventListener('click', start_game)