"use strict";

Game_MODULE = (function (Game_MODULE) {
    let startGame,
        updateGame;

    let mouseState;
    
    // Begins the game
    startGame = function (XSize, YSize) {
        // Extracting images from paths
        Game_MODULE.wallTextures.init();
        Game_MODULE.stickTextures.init();

        // Starting gameArea
        Game_MODULE.gameArea.setupCanvas(XSize, YSize);
        // Setting update frequency
        Game_MODULE.gameArea.updateInterval = setInterval(updateGame, 20);

        // Adding event listeners
        Game_MODULE.gameArea.canvas.addEventListener("mousemove", mouseState.changeMousePos);
        Game_MODULE.gameArea.canvas.addEventListener("mouseup", mouseState.mouseReleased);
    };

    // Updates entire gameboard
    updateGame = function () {
        // Clears the canvas
        Game_MODULE.gameArea.clear();

        // Updates sticks checking if they collide with the mouse
        for (let i = 0; i < Game_MODULE.gameArea.sticks.length; i += 1) {
            Game_MODULE.gameArea.sticks[i].update(mouseState, Game_MODULE.stickTextures, Game_MODULE.gameArea);
        }

        // Updates wallSegments
        for (let i = 0; i < Game_MODULE.gameArea.wallSegments.length; i += 1) {
            Game_MODULE.gameArea.wallSegments[i].update(Game_MODULE.gameArea.context, Game_MODULE.wallTextures);
        }

        // Updates squares
        for (let i = 0; i < Game_MODULE.gameArea.squares.length; i += 1) {
            Game_MODULE.gameArea.squares[i].update(Game_MODULE.gameArea.context, Game_MODULE.gameArea);
        }
    };

    // Monitors the state of the mouse and the cursor
    mouseState = {
        // Cursor coordinates
        x: 0,
        y: 0,

        // Initial release coordinates
        mouseReleaseLocation: {
            x: -1,
            y: -1,
            recently: false
        },

        // Record cursor coordinate change
        changeMousePos: function (event) {
            let rect = Game_MODULE.gameArea.canvas.getBoundingClientRect();
            mouseState.x = event.clientX - rect.left;
            mouseState.y = event.clientY - rect.top;
        },

        // Record cursor coordinate for last release
        mouseReleased: function (event) {
            let rect = Game_MODULE.gameArea.canvas.getBoundingClientRect();
            mouseState.mouseReleaseLocation.x = event.clientX - rect.left;
            mouseState.mouseReleaseLocation.y = event.clientY - rect.top;
            mouseState.mouseReleaseLocation.recently = true;
        }
    };

    Game_MODULE.startGame = startGame;
    Game_MODULE.updateGame = updateGame;

    return Game_MODULE;
})(Game_MODULE);
