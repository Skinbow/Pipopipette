// Functions
var startGame;
var updateGame;
var startExchangeWithServer;

var waitForPlayers;
var waitToJoin;

var XSize;
var YSize;

waitForPlayers = function (neededPlayers)
{
    console.log(Object.keys(players.dict).length);
    if (Object.keys(players.dict).length < neededPlayers)
    {
        setTimeout("waitForPlayers(" + neededPlayers + ");", 1000);
        return;
    } 
    else
    {
        startGame();
    }
};

waitToJoin = function ()
{
    if (Object.keys(players.dict).length === 0)
    {
        setTimeout("waitToJoin();", 1000);
        return;
    } 
    else
    {
        waitForPlayers();
    }
};

startExchangeWithServer = function ()
{
    console.log(socket.id);
    var urlParams = new URLSearchParams(window.location.search);

    socket.on("joined", (playerInfo) => {
        console.log("hey there");
        players.add(playerInfo.id, playerInfo.nickname);
    });

    if (urlParams.get("gameopt") === "create")
    {
        players.add(socket.id, urlParams.get("nname"));

        XSize = parseInt(urlParams.get("xsize"));
        YSize = parseInt(urlParams.get("ysize"));

        socket.emit("create", {
            XSize: XSize,
            YSize: YSize,
            ownerNickname: players.dict[socket.id].nickname
        });

        console.log("Waiting for players");
        waitForPlayers(parseInt(urlParams.get("playernum")));
    }
    else if (urlParams.get("gameopt") === "join")
    {
        socket.emit("joining", {
            index: urlParams.get("index"),
            nickname: urlParams.get("nname")
        });

        socket.on("gameInfo", (gameInfo) => {
            XSize = gameInfo.XSize;
            YSize = gameInfo.YSize;
            players.dict = gameInfo.playerdict;
        });

        console.log("Joining");
        waitToJoin();
    }
};

// Begins the game
startGame = function () {
    // Extracting images from paths
    wallTextures.init();
    stickTextures.init();

    // Starting myGameArea
    myGameArea.start(XSize, YSize);

    // Adding event listeners
    myGameArea.canvas.addEventListener("mousemove", mouseState.changeMousePos);
    myGameArea.canvas.addEventListener("mouseup", mouseState.mouseReleased);
};

// Updates entire gameboard
updateGame = function () {
    var i;

    // Clears the canvas
    myGameArea.clear();

    // Updates sticks checking if they collide with the mouse
    for (i = 0; i < myGameArea.sticks.length; i += 1) {
        myGameArea.sticks[i].update(myGameArea.sticks[i].collisionBox.collidesWithPoint(mouseState.x, mouseState.y));
    }

    // Updates wallSegments
    for (i = 0; i < myGameArea.wallSegments.length; i += 1) {
        myGameArea.wallSegments[i].update();
    }

    // Updates squares
    for (i = 0; i < myGameArea.squares.length; i += 1) {
        myGameArea.squares[i].update();
    }
};

// Set event listener
socket.on("connect", function ()
{
    startExchangeWithServer();
}); 

var myGameArea;
var stickTextures;
var wallTextures;
var mouseState;
var players;

players =
{
    dict: {},
    add: function (id, nickname)
    {
        this.dict[id] = {nickname: nickname, color: "red"};
    }
};

// Textures imported from Assets folder for the "stick" type GameComponents
stickTextures =
{
    vertical:
    {
        IDLE: "./assets/StickVertical.png",
        hover: "./assets/StickVertical_hover.png",
        yellow: "./assets/StickVertical_yellow.png",
        blue: "./assets/StickVertical_blue.png"
    },
    horizontal:
    {
        IDLE: "./assets/StickHorizontal.png",
        hover: "./assets/StickHorizontal_hover.png",
        yellow: "./assets/StickHorizontal_yellow.png",
        blue: "./assets/StickHorizontal_blue.png"
    },

    // Method used to extract images from paths
    init: function () {
        var orientation,
            key,
            tempImg;

        // Creating images with given source paths
        for (orientation in stickTextures) {
            if (orientation !== "init") {
                for (key in stickTextures[orientation]) {
                    tempImg = new Image();
                    tempImg.src = stickTextures[orientation][key];
                    stickTextures[orientation][key] = tempImg;
                }
            }
        }
    }
};

// Textures imported from Assets folder for the "wall segment" type GameComponents
wallTextures =
{
    top: "./assets/WallTop.png",
    left: "./assets/WallLeft.png",
    bottom: "./assets/WallBottom.png",
    right: "./assets/WallRight.png",

    // Method used to extract images from paths
    init: function () {
        var key;
        var tempImg;

        // Creating images with given source paths
        for (key in wallTextures) {
            if (key !== "init") {
                tempImg = new Image();

                tempImg.src = wallTextures[key];
                wallTextures[key] = tempImg;
            }
        }
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
        this.squaresHeight = xSize;// = 7
        this.squaresWidth = ySize;// = 7
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
        var i;
        var j;
        // Filling GameComponent list with horizontal sticks
        for (i = 0; i < this.squaresWidth; i += 1) {
            for (j = 0; j < this.squaresHeight + 1; j += 1) {
                if (j !== 0 && j !== this.squaresHeight) {
                    this.sticks.push(new Stick(65 * i + 5, 65 * j, 64, 9, "horizontal"));
                }
            }
        }

        // Filling GameComponent list with vertical sticks
        for (i = 0; i < this.squaresWidth + 1; i += 1) {
            for (j = 0; j < this.squaresHeight; j += 1) {
                if (i !== 0 && i !== this.squaresWidth) {
                    this.sticks.push(new Stick(65 * i, 65 * j + 5, 9, 64, "vertical"));
                }
            }
        }
    },

    // Fills GameComponent lists with wall segments
    fillWallSegments: function () {
        var i;
        var j;
        // Filling GameComponent list with horizontal wall segments
        for (i = 0; i < this.squaresWidth; i += 1) {
            for (j = 0; j < this.squaresHeight + 1; j += 1) {
                if (j === 0) {
                    this.wallSegments.push(new WallSegment(65 * i, 65 * j, 74, 9, "top"));
                } else if (j === this.squaresHeight) {
                    this.wallSegments.push(new WallSegment(65 * i, 65 * j, 74, 9, "bottom"));
                }
            }
        }

        // Filling GameComponent list with vertical wall segments
        for (i = 0; i < this.squaresWidth + 1; i += 1) {
            for (j = 0; j < this.squaresHeight; j += 1) {
                if (i === 0) {
                    this.wallSegments.push(new WallSegment(65 * i, 65 * j, 9, 74, "left"));
                } else if (i === this.squaresWidth) {
                    this.wallSegments.push(new WallSegment(65 * i, 65 * j, 9, 74, "right"));
                }
            }
        }
    },

    // Fills squares list with squares
    fillSquares: function () {
        var i;
        var j;
        for (i = 0; i < this.squaresWidth; i += 1) {
            for (j = 0; j < this.squaresHeight; j += 1) {
                this.squares.push(new Square(65 * i + 10, 65 * j + 10, 54, 54));
            }
        }
    },

    // Finds all neighbours of the sticks
    findStickNeighbours: function () {
        var i;
        for (i = 0; i < this.sticks.length; i += 1) {
            this.sticks[i].findNeighbours();
        }
    },

    // Finds all neighbours of the squares
    findSquareNeigbours: function () {
        var i;
        for (i = 0; i < this.squares.length; i += 1) {
            this.squares[i].findNeighbours();
        }
    },

    // Clears the canvas
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
        var rect = myGameArea.canvas.getBoundingClientRect();
        mouseState.x = event.clientX - rect.left;
        mouseState.y = event.clientY - rect.top;
    },

    // Record cursor coordinate for last release
    mouseReleased: function (event) {
        var rect = myGameArea.canvas.getBoundingClientRect();
        mouseState.mouseReleaseLocation.x = event.clientX - rect.left;
        mouseState.mouseReleaseLocation.y = event.clientY - rect.top;
        mouseState.mouseReleaseLocation.recently = true;
    }
};

// Every element in the game is an instance of GameComponent
class GameComponent {
    constructor (x, y, width, height) {
        this.ctx = myGameArea.context;
        this.collisionBox = new CollisionBox(this.x, this.y, this.width, this.height);

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

// GameComponent can be of type "Stick", aka one of the sticks in the game
class Stick extends GameComponent {
    constructor (x, y, width, height, orientation) {
        super(x, y, width, height);

        this.orientation = orientation;

        this.owner = "";
        this.hover = false;

        // List of GameComponent of type "Square" that collide with this stick
        this.neighbouringSquares = [];

        // Every stick has an assigned id
        this.id = myGameArea.sticks.length;

        this.makeCollisionBox();
    }

    isActive () {
        if (this.owner.length !== 0) {
            return true;
        } else {
            return false;
        }
    }

    // How the stick updates at every frame
    update (MouseCollides) {
        var i;

        // Made to avoid several sticks being activated at once
        this.checkIfHoveringOverOne(MouseCollides);

        // Active if mouse was hovering over this stick only and the left mouse button was released
        if (this.collisionBox.collidesWithPoint(mouseState.mouseReleaseLocation.x, mouseState.mouseReleaseLocation.y) && mouseState.mouseReleaseLocation.recently && this.hover) {
            mouseState.mouseReleaseLocation.recently = false;
            this.claimStick(players[socket.id]);
            for (i = 0; i < this.neighbouringSquares.length; i += 1) {
                // Trying to claim surrounding squares which get claimed if all the sticks surrounding them are active
                console.log(players[socket.id].color);
                this.neighbouringSquares[i].claimSquare(players[socket.id].color);
            }
        }
        this.display();
    }

    // Displaying the stick
    display () {
        if (this.orientation === "horizontal") {
            if (this.isActive()) {
                this.ctx.drawImage(stickTextures.horizontal[this.owner], this.x, this.y, this.width, this.height);
            } else if (!this.hover) {
                this.ctx.drawImage(stickTextures.horizontal.IDLE, this.x, this.y, this.width, this.height);
            } else {
                this.ctx.drawImage(stickTextures.horizontal.hover, this.x, this.y, this.width, this.height);
            }
        } else if (this.orientation === "vertical") {
            if (this.isActive()) {
                this.ctx.drawImage(stickTextures.vertical[this.owner], this.x, this.y, this.width, this.height);
            } else if (!this.hover) {
                this.ctx.drawImage(stickTextures.vertical.IDLE, this.x, this.y, this.width, this.height);
            } else {
                this.ctx.drawImage(stickTextures.vertical.hover, this.x, this.y, this.width, this.height);
            }
        }
    }

    // Assigning a collisionBox to the stick which depends on the stick"s orientation
    makeCollisionBox () {
        if (this.orientation === "horizontal") {
            this.collisionBox = new CollisionBox(this.x - 1, this.y, this.width + 2, this.height);
        } else if (this.orientation === "vertical") {
            this.collisionBox = new CollisionBox(this.x, this.y - 1, this.width, this.height + 2);
        }
    }

    // Fills this.neighbours with neighbouring sticks and wall segments
    findNeighbours () {
        this.neighbouringSticks = [];
        this.neighbouringWallSegments = [];
        var i;
        for (i = 0; i < myGameArea.sticks.length; i += 1) {
            if (this.collisionBox.collidesWithBox(myGameArea.sticks[i].collisionBox)) {
                this.neighbouringSticks.push(myGameArea.sticks[i]);
            }
        }
        for (i = 0; i < myGameArea.wallSegments.length; i += 1) {
            if (this.collisionBox.collidesWithBox(myGameArea.wallSegments[i].collisionBox)) {
                this.neighbouringWallSegments.push(myGameArea.wallSegments[i]);
            }
        }
    }

    // Attempt to claim stick
    claimStick (tryingOwner) {
        // If stick already belongs to someone
        if (!this.isActive()) {
            // If stick touches an active stick or a wall segment
            if (this.checkIfNeighboursAllowColoration()) {
                this.owner = tryingOwner.color;
                console.log("stick claimed by " + tryingOwner.name);
                socket.emit("claimedStick", tryingOwner, this.id);
            }
        }
    }

    // Checks if stick touches an active stick or a wall segment
    checkIfNeighboursAllowColoration () {
        var i;
        for (i = 0; i < this.neighbours.length; i += 1) {
            if (this.neighbours[i].type === "wall segment" || this.neighbours[i].isActive()) {
                return true;
            }
        }
        return false;
    }

    // Checks if mouse is hovering over only one stick
    checkIfHoveringOverOne (MouseCollides) {
        var i,
            foundHover;
        if (MouseCollides) {
            foundHover = false;
            for (i = 0; i < myGameArea.sticks.length; i += 1) {
                if (myGameArea.sticks[i].hover) {
                    foundHover = true;
                    break;
                }
            }
            if (!foundHover) {
                this.hover = true;
            }
        } else {
            this.hover = false;
        }
    }
}

// GameComponent can be of type "WallSegment", aka one of the sticks surrounding the board in the game
class WallSegment extends GameComponent {
    constructor (x, y, width, height, orientation) {
        super(x, y, width, height);

        this.orientation = orientation;
    }

    // How the wall segment updates at every frame
    update () {
        // Wall segments can have 4 differemt orientations
        if (this.orientation === "top") {
            this.ctx.drawImage(wallTextures.top, this.x, this.y, this.width, this.height);
        } else if (this.orientation === "left") {
            this.ctx.drawImage(wallTextures.left, this.x, this.y, this.width, this.height);
        } else if (this.orientation === "bottom") {
            this.ctx.drawImage(wallTextures.bottom, this.x, this.y, this.width, this.height);
        } else if (this.orientation === "right") {
            this.ctx.drawImage(wallTextures.right, this.x, this.y, this.width, this.height);
        }
    }
}

// GameComponent can be of type "square", aka one of the squares that get colored when all the sticks around them are active
class Square extends GameComponent {
    constructor (x, y, width, height) {
        super(x, y, width, height);

        this.owner = "white";

        // List containing all sticks that touch the square
        this.neighbouringSticks = [];
        this.collisionBox = new CollisionBox(this.x - 4, this.y - 4, this.width + 8, this.height + 8);
    }

    // How the square updates at every frame
    update () {
        this.ctx = myGameArea.context;
        this.ctx.fillStyle = this.owner;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // Claims the square located next to a clicked stick
    // If all of the square"s neighbouring sticks are active, it will be colored
    claimSquare (tryingOwner) {
        if (this.owner === "white") {
            if (this.checkIfAllSurroundingSticksActive()) {
                this.owner = tryingOwner;
            }
        }
    }

    // Checking if all of the square"s neighbours are active
    checkIfAllSurroundingSticksActive () {
        var i;
        var notActive = false;
        for (i = 0; i < this.neighbouringSticks.length; i += 1) {
            if (!this.neighbouringSticks[i].isActive()) {
                notActive = true;
                break;
            }
        }

        if (!notActive) {
            return true;
        } else {
            return false;
        }
    }

    // Fills neighbouringSticks with sticks colliding with square
    findNeighbours () {
        var i;
        for (i = 0; i < myGameArea.sticks.length; i += 1) {
            if (this.collisionBox.collidesWithBox(myGameArea.sticks[i].collisionBox)) {
                this.neighbouringSticks.push(myGameArea.sticks[i]);
                myGameArea.sticks[i].neighbouringSquares.push(this);
            }
        }
    }
}

// Constructor that creates collision boxes for game components
class CollisionBox {
    constructor (x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    // Checks if x and y coordinates are inside the CollisionBox
    collidesWithPoint (x, y) {
        if ((x >= this.x && x <= this.x + this.width) &&
                    (y >= this.y && y <= this.y + this.height)) {
            return true;
        } else {
            return false;
        }
    }

    // Checks whether two collisionBox objects collide
    collidesWithBox (otherBox) {
        // Checking if any of the other object"s corners collide with this object
        if (this.collidesWithPoint(otherBox.x, otherBox.y) ||
            this.collidesWithPoint(otherBox.x + otherBox.width, otherBox.y) ||
            this.collidesWithPoint(otherBox.x, otherBox.y + otherBox.height) ||
            this.collidesWithPoint(otherBox.x + otherBox.width, otherBox.y + otherBox.height) ||
        // Checking if any of this object"s corners collide with the other object
            otherBox.collidesWithPoint(this.x, this.y) ||
            otherBox.collidesWithPoint(this.x + this.width, this.y) ||
            otherBox.collidesWithPoint(this.x, this.y + this.height) ||
            otherBox.collidesWithPoint(this.x + this.width, this.y + this.height)) {
            return true;
        } else {
            return false;
        }
    }
}

// Objects
var myGameArea;
var stickTextures;
var wallTextures;
var mouseState;
var players;

players =
{
    dict: {},
    add: function (id, nickname)
    {
        this.dict[id] = {nickname: nickname, color: "red"};
    }
};

// Textures imported from Assets folder for the "stick" type GameComponents
stickTextures =
{
    vertical:
    {
        IDLE: "./assets/StickVertical.png",
        hover: "./assets/StickVertical_hover.png",
        yellow: "./assets/StickVertical_yellow.png",
        blue: "./assets/StickVertical_blue.png"
    },
    horizontal:
    {
        IDLE: "./assets/StickHorizontal.png",
        hover: "./assets/StickHorizontal_hover.png",
        yellow: "./assets/StickHorizontal_yellow.png",
        blue: "./assets/StickHorizontal_blue.png"
    },

    // Method used to extract images from paths
    init: function () {
        var orientation,
            key,
            tempImg;

        // Creating images with given source paths
        for (orientation in stickTextures) {
            if (orientation !== "init") {
                for (key in stickTextures[orientation]) {
                    tempImg = new Image();
                    tempImg.src = stickTextures[orientation][key];
                    stickTextures[orientation][key] = tempImg;
                }
            }
        }
    }
};

// Textures imported from Assets folder for the "wall segment" type GameComponents
wallTextures =
{
    top: "./assets/WallTop.png",
    left: "./assets/WallLeft.png",
    bottom: "./assets/WallBottom.png",
    right: "./assets/WallRight.png",

    // Method used to extract images from paths
    init: function () {
        var key;
        var tempImg;

        // Creating images with given source paths
        for (key in wallTextures) {
            if (key !== "init") {
                tempImg = new Image();

                tempImg.src = wallTextures[key];
                wallTextures[key] = tempImg;
            }
        }
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
        this.squaresHeight = xSize;// = 7
        this.squaresWidth = ySize;// = 7
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
        var i;
        var j;
        // Filling GameComponent list with horizontal sticks
        for (i = 0; i < this.squaresWidth; i += 1) {
            for (j = 0; j < this.squaresHeight + 1; j += 1) {
                if (j !== 0 && j !== this.squaresHeight) {
                    this.sticks.push(new Stick(65 * i + 5, 65 * j, 64, 9, "horizontal"));
                }
            }
        }

        // Filling GameComponent list with vertical sticks
        for (i = 0; i < this.squaresWidth + 1; i += 1) {
            for (j = 0; j < this.squaresHeight; j += 1) {
                if (i !== 0 && i !== this.squaresWidth) {
                    this.sticks.push(new Stick(65 * i, 65 * j + 5, 9, 64, "vertical"));
                }
            }
        }
    },

    // Fills GameComponent lists with wall segments
    fillWallSegments: function () {
        var i;
        var j;
        // Filling GameComponent list with horizontal wall segments
        for (i = 0; i < this.squaresWidth; i += 1) {
            for (j = 0; j < this.squaresHeight + 1; j += 1) {
                if (j === 0) {
                    this.wallSegments.push(new WallSegment(65 * i, 65 * j, 74, 9, "top"));
                } else if (j === this.squaresHeight) {
                    this.wallSegments.push(new WallSegment(65 * i, 65 * j, 74, 9, "bottom"));
                }
            }
        }

        // Filling GameComponent list with vertical wall segments
        for (i = 0; i < this.squaresWidth + 1; i += 1) {
            for (j = 0; j < this.squaresHeight; j += 1) {
                if (i === 0) {
                    this.wallSegments.push(new WallSegment(65 * i, 65 * j, 9, 74, "left"));
                } else if (i === this.squaresWidth) {
                    this.wallSegments.push(new WallSegment(65 * i, 65 * j, 9, 74, "right"));
                }
            }
        }
    },

    // Fills squares list with squares
    fillSquares: function () {
        var i;
        var j;
        for (i = 0; i < this.squaresWidth; i += 1) {
            for (j = 0; j < this.squaresHeight; j += 1) {
                this.squares.push(new Square(65 * i + 10, 65 * j + 10, 54, 54));
            }
        }
    },

    // Finds all neighbours of the sticks
    findStickNeighbours: function () {
        var i;
        for (i = 0; i < this.sticks.length; i += 1) {
            this.sticks[i].findNeighbours();
        }
    },

    // Finds all neighbours of the squares
    findSquareNeigbours: function () {
        var i;
        for (i = 0; i < this.squares.length; i += 1) {
            this.squares[i].findNeighbours();
        }
    },

    // Clears the canvas
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
        var rect = myGameArea.canvas.getBoundingClientRect();
        mouseState.x = event.clientX - rect.left;
        mouseState.y = event.clientY - rect.top;
    },

    // Record cursor coordinate for last release
    mouseReleased: function (event) {
        var rect = myGameArea.canvas.getBoundingClientRect();
        mouseState.mouseReleaseLocation.x = event.clientX - rect.left;
        mouseState.mouseReleaseLocation.y = event.clientY - rect.top;
        mouseState.mouseReleaseLocation.recently = true;
    }
};
