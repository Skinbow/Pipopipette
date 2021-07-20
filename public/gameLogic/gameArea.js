Game_MODULE = (function (Game_MODULE) {
    // The canvas where everyting is drawn
    let GameArea = function () {
        // Private methods
        let fillSticks,
            fillWallSegments,
            fillSquares,
            findStickNeighbours,
            findSquareNeigbours;

        this.sticks = [];
        this.wallSegments = [];
        this.squares = [];
        this.playersTurn = {};
        this.myTurn = false;
        this.exists = false;

        this.stickLength = 64;
        this.stickWidth = 9;
        this.wallSegmentLength = 74;
        this.wallSegmentWidth = 9;

        // Function that initialises everything
        this.setupCanvas = function (xSize, ySize) {
            this.canvas = document.createElement("canvas");

            this.scale = 3;
            do {
                this.canvas.width = this.scale * (xSize * (this.stickLength + 1) + 10);
                this.canvas.height = this.scale * (ySize * (this.stickLength + 1) + 10);
            } while ((this.scale-- !== 1) && (this.canvas.width > 0.8 * $(window).width() || this.canvas.height > 0.8 * $(window).height()));
            this.scale++;

            this.canvas.style.cssText += "margin: 0 auto; display: block;";
            if (this.canvas.height < 0.8 * $(window).height())
            {
                this.canvas.style.cssText += "position: relative; top: " + ((0.8 * $(window).height() - this.canvas.height) / 2).toString() + "px;";
            }

            // Number of squares horizontally and vertically
            this.squaresWidth = parseInt(xSize);
            this.squaresHeight = parseInt(ySize);
            this.context = this.canvas.getContext("2d");
            this.context.scale(this.scale, this.scale);

            // Disabling anti-aliasing
            this.context.webkitImageSmoothingEnabled = false;
            this.context.mozImageSmoothingEnabled = false;
            this.context.imageSmoothingEnabled = false;


            // Inserting canvas into HTML document
            document.getElementById("divForCanvas").appendChild(this.canvas);

            fillSticks(this);
            fillWallSegments(this);
            fillSquares(this);

            findStickNeighbours(this);
            findSquareNeigbours(this);

            this.exists = true;
        };

        // Clears the canvas
        this.clear = function () {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        };

        // Destroys the canvas and cancles the canvas's hs
        this.destroy = function () {
            if (this.exists)
            {
                clearInterval(this.updateInterval);
                document.getElementById("divForCanvas").removeChild(this.canvas);
                this.canvas.remove();
                this.exists = false;
            }
        };

        this.setPlayersTurn = function (myId, playerId, playerNickname, playerColor)
        {
            this.playersTurn = { id: playerId, nickname: playerNickname, color: playerColor };
            this.myTurn = (myId === playerId);
        };

        // Filling GameComponent list with sticks
        fillSticks = function (gameArea) {
            // Filling GameComponent list with horizontal sticks
            for (let i = 0; i < gameArea.squaresWidth; i += 1) {
                for (let j = 1; j < gameArea.squaresHeight; j += 1) {
                    gameArea.sticks.push(new Game_MODULE.Stick((gameArea.stickLength + 1) * i + 5, (gameArea.stickLength + 1) * j, gameArea.stickLength, gameArea.stickWidth, "horizontal", gameArea.sticks.length));
                }
            }

            // Filling GameComponent list with vertical sticks
            for (let i = 1; i < gameArea.squaresWidth; i += 1) {
                for (let j = 0; j < gameArea.squaresHeight; j += 1) {
                    gameArea.sticks.push(new Game_MODULE.Stick((gameArea.stickLength + 1) * i, (gameArea.stickLength + 1) * j + 5, gameArea.stickWidth, gameArea.stickLength, "vertical", gameArea.sticks.length));
                }
            }
        };

        // Fills GameComponent lists with wall segments
        fillWallSegments = function (gameArea) {
            // Filling GameComponent list with horizontal wall segments
            for (let i = 0; i < gameArea.squaresWidth; i += 1)
            {
                gameArea.wallSegments.push(new Game_MODULE.WallSegment((gameArea.stickLength + 1) * i, 0, gameArea.wallSegmentLength, gameArea.wallSegmentWidth, "top"));
                gameArea.wallSegments.push(new Game_MODULE.WallSegment((gameArea.stickLength + 1) * i, (gameArea.stickLength + 1) * gameArea.squaresHeight, gameArea.wallSegmentLength, gameArea.wallSegmentWidth, "bottom"));
            }

            // Filling GameComponent list with vertical wall segments
            for (let j = 0; j < gameArea.squaresHeight; j += 1) {
                gameArea.wallSegments.push(new Game_MODULE.WallSegment(0, (gameArea.stickLength + 1) * j, gameArea.wallSegmentWidth, gameArea.wallSegmentLength, "left"));
                gameArea.wallSegments.push(new Game_MODULE.WallSegment((gameArea.stickLength + 1) * gameArea.squaresWidth, (gameArea.stickLength + 1) * j, gameArea.wallSegmentWidth, gameArea.wallSegmentLength, "right"));
            }
        };

        // Fills squares list with squares
        fillSquares = function (gameArea) {
            for (let i = 0; i < gameArea.squaresWidth; i += 1) {
                for (let j = 0; j < gameArea.squaresHeight; j += 1) {
                    gameArea.squares.push(new Game_MODULE.Square((gameArea.stickLength + 1) * i + 10, (gameArea.stickLength + 1) * j + 10, 54, 54));
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
