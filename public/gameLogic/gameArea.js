Game_MODULE = (function (Game_MODULE) {
    // The canvas where everyting is drawn
    let GameArea = function () {
        // Private methods
        let fillSticks,
            fillWallSegments,
            fillSquares,
            findStickNeighbours,
            findSquareNeigbours;

        this.sticks = [],
        this.wallSegments = [],
        this.squares = [],
        this.turn = 0;

        // Function that initialises everything
        this.setupCanvas = function (xSize, ySize) {
            this.canvas = document.createElement("canvas");
            this.canvas.width = 800;
            this.canvas.height = 600;

            // Number of squares horizontally and vertically
            this.squaresHeight = parseInt(xSize);
            this.squaresWidth = parseInt(ySize);
            this.context = this.canvas.getContext("2d");

            // Inserting canvas into HTML document
            document.body.insertBefore(this.canvas, document.body.childNodes[0]);

            fillSticks(this);
            fillWallSegments(this);
            fillSquares(this);

            findStickNeighbours(this);
            findSquareNeigbours(this);
        };

        // Clears the canvas
        this.clear = function () {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        };

        // Destroys the canvas and cancles the canvas's updates
        this.destroy = function () {
            clearInterval(this.updateInterval);
            this.canvas.remove();
        };

        this.setPlayersTurn = function (playerId)
        {
            this.turn = playerId;
        };

        // Filling GameComponent list with sticks
        fillSticks = function (gameArea) {
            // Filling GameComponent list with horizontal sticks
            for (let i = 0; i < gameArea.squaresWidth; i += 1) {
                for (let j = 0; j < gameArea.squaresHeight + 1; j += 1) {
                    if (j !== 0 && j !== gameArea.squaresHeight) {
                        gameArea.sticks.push(new Game_MODULE.Stick(65 * i + 5, 65 * j, 64, 9, "horizontal", gameArea.sticks.length));
                    }
                }
            }

            // Filling GameComponent list with vertical sticks
            for (let i = 0; i < gameArea.squaresWidth + 1; i += 1) {
                for (let j = 0; j < gameArea.squaresHeight; j += 1) {
                    if (i !== 0 && i !== gameArea.squaresWidth) {
                        gameArea.sticks.push(new Game_MODULE.Stick(65 * i, 65 * j + 5, 9, 64, "vertical", gameArea.sticks.length));
                    }
                }
            }
        };

        // Fills GameComponent lists with wall segments
        fillWallSegments = function (gameArea) {
            // Filling GameComponent list with horizontal wall segments
            for (let i = 0; i < gameArea.squaresWidth; i += 1) {
                for (let j = 0; j < gameArea.squaresHeight + 1; j += 1) {
                    if (j === 0) {
                        gameArea.wallSegments.push(new Game_MODULE.WallSegment(65 * i, 65 * j, 74, 9, "top"));
                    } else if (j === gameArea.squaresHeight) {
                        gameArea.wallSegments.push(new Game_MODULE.WallSegment(65 * i, 65 * j, 74, 9, "bottom"));
                    }
                }
            }

            // Filling GameComponent list with vertical wall segments
            for (let i = 0; i < gameArea.squaresWidth + 1; i += 1) {
                for (let j = 0; j < gameArea.squaresHeight; j += 1) {
                    if (i === 0) {
                        gameArea.wallSegments.push(new Game_MODULE.WallSegment(65 * i, 65 * j, 9, 74, "left"));
                    } else if (i === gameArea.squaresWidth) {
                        gameArea.wallSegments.push(new Game_MODULE.WallSegment(65 * i, 65 * j, 9, 74, "right"));
                    }
                }
            }
        };

        // Fills squares list with squares
        fillSquares = function (gameArea) {
            for (let i = 0; i < gameArea.squaresWidth; i += 1) {
                for (let j = 0; j < gameArea.squaresHeight; j += 1) {
                    gameArea.squares.push(new Game_MODULE.Square(65 * i + 10, 65 * j + 10, 54, 54));
                }
            }
        };

        // Finds all neighbours of the sticks
        findStickNeighbours = function (gameArea) {
            for (let i = 0; i < gameArea.sticks.length; i += 1) {
                gameArea.sticks[i].findNeighbours(gameArea);
            }
        };

        // Finds all neighbours of the squares
        findSquareNeigbours = function (gameArea) {
            for (let i = 0; i < gameArea.squares.length; i += 1) {
                gameArea.squares[i].findNeighbours(gameArea);
            }
        };
    };
    
    Game_MODULE.gameArea = new GameArea;

    return Game_MODULE;
})(Game_MODULE);