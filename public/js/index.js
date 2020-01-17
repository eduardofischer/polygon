// Update the player color each time it changes
document.querySelectorAll('.color').forEach(el => {
    el.addEventListener('change', () => {
        document.querySelector('#login_button').style.backgroundColor = el.value;
        document.querySelector('#colors').dataset.color = el.value;
    })
});

// Start the game when ENTER is pressed
document.querySelector('#login_box').addEventListener('keypress', event => {
    if (event.keyCode == 13) {
        start_game();
    }
})