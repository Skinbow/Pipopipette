"use strict";

Game_MODULE = (function (Game_MODULE) {
    let startGame,
        updateGame;

    let mouseState;

    // Begins the game
    startGame = function (XSize, YSize, stickClaimAlertFunction) {
        // Extracting images from paths
        Game_MODULE.wallTextures.init();
        Game_MODULE.stickTextures.init();

        let gameArea = Game_MODULE.gameArea;

        // Starting gameArea
        gameArea.setupCanvas(XSize, YSize);
        // Setting update frequency
        gameArea.updateInterval = setInterval(function () { updateGame(stickClaimAlertFunction); }, 20);

        // Adding event listeners
        gameArea.canvas.addEventListener("mousemove", mouseState.changeMousePos);
        gameArea.canvas.addEventListener("mouseup", mouseState.mouseReleased);
    };

    // Updates entire gameboard
    updateGame = function (stickClaimAlertFunction) {
        let gameArea = Game_MODULE.gameArea;

        // Clears the canvas
        gameArea.clear();

        // Updates sticks checking if they collide with the mouse
        for (let i = 0; i < gameArea.sticks.length; i += 1) {
            gameArea.sticks[i].update(mouseState, Game_MODULE.stickTextures, gameArea, gameArea.myTurn, stickClaimAlertFunction);
        }

        // Updates wallSegments
        for (let i = 0; i < gameArea.wallSegments.length; i += 1) {
            gameArea.wallSegments[i].update(gameArea.context, Game_MODULE.wallTextures);
        }

        // Updates squares
        for (let i = 0; i < gameArea.squares.length; i += 1) {
            gameArea.squares[i].update(gameArea.context, gameArea);
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
            const scale = Game_MODULE.gameArea.scale;
            let rect = Game_MODULE.gameArea.canvas.getBoundingClientRect();
            mouseState.x = (event.clientX - rect.left) / scale;
            mouseState.y = (event.clientY - rect.top) / scale;
        },

        // Record cursor coordinate for last release
        mouseReleased: function (event) {
            const scale = Game_MODULE.gameArea.scale;
            let rect = Game_MODULE.gameArea.canvas.getBoundingClientRect();
            mouseState.mouseReleaseLocation.x = (event.clientX - rect.left) / scale;
            mouseState.mouseReleaseLocation.y = (event.clientY - rect.top) / scale;
            mouseState.mouseReleaseLocation.recently = true;
        }
    };

    Game_MODULE.startGame = startGame;
    Game_MODULE.updateGame = updateGame;

    return Game_MODULE;
})(Game_MODULE);
