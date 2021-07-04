"use strict";

Game_MODULE = (function (Game_MODULE) {
    let myGameArea,
        stickTextures,
        stickTexturesInitiated = false,
        wallTextures,
        wallTexturesInitiated = false,
        mouseState;

    let startGame,
        updateGame;
    
    // Begins the game
    startGame = function (XSize, YSize) {
        // Extracting images from paths
        if (!wallTexturesInitiated)
            wallTextures.init();
        if (!stickTexturesInitiated)
            stickTextures.init();

        // Starting myGameArea
        myGameArea.start(XSize, YSize);

        // Adding event listeners
        myGameArea.canvas.addEventListener("mousemove", mouseState.changeMousePos);
        myGameArea.canvas.addEventListener("mouseup", mouseState.mouseReleased);
    };

    // Updates entire gameboard
    updateGame = function () {
        // Clears the canvas
        myGameArea.clear();

        // Updates sticks checking if they collide with the mouse
        for (let i = 0; i < myGameArea.sticks.length; i += 1) {
            myGameArea.sticks[i].update(mouseState, stickTextures, myGameArea);
        }

        // Updates wallSegments
        for (let i = 0; i < myGameArea.wallSegments.length; i += 1) {
            myGameArea.wallSegments[i].update(myGameArea.context, wallTextures);
        }

        // Updates squares
        for (let i = 0; i < myGameArea.squares.length; i += 1) {
            myGameArea.squares[i].update(myGameArea.context, myGameArea);
        }
    };

    // Textures imported from Assets folder for the "stick" type GameComponents
    stickTextures =
    {
        vertical:
        {
            IDLE: "./public/assets/StickVertical.png",
            hover: "./public/assets/StickVertical_hover.png",
            yellow: "./public/assets/StickVertical_yellow.png",
            blue: "./public/assets/StickVertical_blue.png"
        },
        horizontal:
        {
            IDLE: "./public/assets/StickHorizontal.png",
            hover: "./public/assets/StickHorizontal_hover.png",
            yellow: "./public/assets/StickHorizontal_yellow.png",
            blue: "./public/assets/StickHorizontal_blue.png"
        },

        // Method used to extract images from paths
        init: function () {
            let orientation,
                key,
                tempImg;

            // Creating images with given source paths
            for (orientation in stickTextures) {
                if (orientation !== "init" && Object.prototype.hasOwnProperty.call(stickTextures, orientation)) {
                    for (key in stickTextures[orientation]) {
                        if (Object.prototype.hasOwnProperty.call(stickTextures[orientation], key))
                        {
                            tempImg = new Image();
                            tempImg.src = stickTextures[orientation][key];
                            stickTextures[orientation][key] = tempImg;
                        }
                        
                    }
                }
            }
            stickTexturesInitiated = true;
        }
    };

    // Textures imported from Assets folder for the "wall segment" type GameComponents
    wallTextures =
    {
        top: "./public/assets/WallTop.png",
        left: "./public/assets/WallLeft.png",
        bottom: "./public/assets/WallBottom.png",
        right: "./public/assets/WallRight.png",

        // Method used to extract images from paths
        init: function () {
            let key,
                tempImg;

            // Creating images with given source paths
            for (key in wallTextures) {
                if (key !== "init" && Object.prototype.hasOwnProperty.call(wallTextures, key)) {
                    tempImg = new Image();

                    tempImg.src = wallTextures[key];
                    wallTextures[key] = tempImg;
                }
            }
            wallTexturesInitiated = true;
        }
    };

    // The canvas where everyting is drawn
    myGameArea = {
        sticks: [],
        wallSegments: [],
        squares: [],

        // Function that initialises everything
        start: function (xSize, ySize) {
            this.canvas = document.createElement("canvas");
            this.canvas.width = 800;
            this.canvas.height = 600;

            // Number of squares horizontally and vertically
            this.squaresHeight = parseInt(xSize);
            this.squaresWidth = parseInt(ySize);
            this.context = this.canvas.getContext("2d");

            // Inserting canvas into HTML document
            document.body.insertBefore(this.canvas, document.body.childNodes[0]);

            this.fillSticks();
            this.fillWallSegments();
            this.fillSquares();

            this.findStickNeighbours();
            this.findSquareNeigbours();

            // Setting update frequency
            this.interval = setInterval(updateGame, 20);
        },

        // Filling GameComponent list with sticks
        fillSticks: function () {
            // Filling GameComponent list with horizontal sticks
            for (let i = 0; i < this.squaresWidth; i += 1) {
                for (let j = 0; j < this.squaresHeight + 1; j += 1) {
                    if (j !== 0 && j !== this.squaresHeight) {
                        this.sticks.push(new Game_MODULE.Stick(65 * i + 5, 65 * j, 64, 9, "horizontal", myGameArea.sticks.length));
                    }
                }
            }

            // Filling GameComponent list with vertical sticks
            for (let i = 0; i < this.squaresWidth + 1; i += 1) {
                for (let j = 0; j < this.squaresHeight; j += 1) {
                    if (i !== 0 && i !== this.squaresWidth) {
                        this.sticks.push(new Game_MODULE.Stick(65 * i, 65 * j + 5, 9, 64, "vertical", myGameArea.sticks.length));
                    }
                }
            }
        },

        // Fills GameComponent lists with wall segments
        fillWallSegments: function () {
            // Filling GameComponent list with horizontal wall segments
            for (let i = 0; i < this.squaresWidth; i += 1) {
                for (let j = 0; j < this.squaresHeight + 1; j += 1) {
                    if (j === 0) {
                        this.wallSegments.push(new Game_MODULE.WallSegment(65 * i, 65 * j, 74, 9, "top"));
                    } else if (j === this.squaresHeight) {
                        this.wallSegments.push(new Game_MODULE.WallSegment(65 * i, 65 * j, 74, 9, "bottom"));
                    }
                }
            }

            // Filling GameComponent list with vertical wall segments
            for (let i = 0; i < this.squaresWidth + 1; i += 1) {
                for (let j = 0; j < this.squaresHeight; j += 1) {
                    if (i === 0) {
                        this.wallSegments.push(new Game_MODULE.WallSegment(65 * i, 65 * j, 9, 74, "left"));
                    } else if (i === this.squaresWidth) {
                        this.wallSegments.push(new Game_MODULE.WallSegment(65 * i, 65 * j, 9, 74, "right"));
                    }
                }
            }
        },

        // Fills squares list with squares
        fillSquares: function () {
            for (let i = 0; i < this.squaresWidth; i += 1) {
                for (let j = 0; j < this.squaresHeight; j += 1) {
                    this.squares.push(new Game_MODULE.Square(65 * i + 10, 65 * j + 10, 54, 54));
                }
            }
        },

        // Finds all neighbours of the sticks
        findStickNeighbours: function () {
            for (let i = 0; i < this.sticks.length; i += 1) {
                this.sticks[i].findNeighbours(myGameArea);
            }
        },

        // Finds all neighbours of the squares
        findSquareNeigbours: function () {
            for (let i = 0; i < this.squares.length; i += 1) {
                this.squares[i].findNeighbours(myGameArea);
            }
        },

        // Clears the canvas
        clear: function () {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        },

        destroy: function () {
            clearInterval(this.interval);
            this.canvas.remove();
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
            let rect = myGameArea.canvas.getBoundingClientRect();
            mouseState.x = event.clientX - rect.left;
            mouseState.y = event.clientY - rect.top;
        },

        // Record cursor coordinate for last release
        mouseReleased: function (event) {
            let rect = myGameArea.canvas.getBoundingClientRect();
            mouseState.mouseReleaseLocation.x = event.clientX - rect.left;
            mouseState.mouseReleaseLocation.y = event.clientY - rect.top;
            mouseState.mouseReleaseLocation.recently = true;
        }
    };

    Game_MODULE.myGameArea = myGameArea;
    Game_MODULE.startGame = startGame;
    Game_MODULE.updateGame = updateGame;

    return Game_MODULE;
})(Game_MODULE);
