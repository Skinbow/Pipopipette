"use strict";

// Functions
var startGame,
    updateGame,
    startExchangeWithServer,
    waitForPlayers,
    waitToJoin,
    resetPage,
    clearWaitingMessages;

// Objects
var myGameArea,
    stickTextures,
    stickTexturesInitiated = false,
    wallTextures,
    wallTexturesInitiated = false,
    mouseState,
    players;

var XSize, YSize;

var socket;
var formVariables;

// Form the players fill in before starting the game
formVariables = {
    nickName: document.getElementById("nickName"),
    radioCreate: document.getElementById("create"),
    radioJoin: document.getElementById("join"),
    gameopt: "create",

    gameCreateDiv: document.getElementById("gameCreateDiv"),
    xSize: document.getElementById("xSize"),
    ySize: document.getElementById("ySize"),
    playernum: document.getElementById("playerNum"),

    gameJoinDiv: document.getElementById("gameJoinDiv"),
    index: document.getElementById("index"),

    submitDiv: document.getElementById("submitDiv"),
    submitButton: document.getElementById("submitButton"),

    joinFailedMessage: document.getElementById("joinFailedMessage"),

    loadFormLogic: function() {
        // Show or hide game joining and creating fields (the two of them should not show at the same time)
        formVariables.radioCreate.onclick = function() {
            formVariables.gameCreateDiv.style.display = "block";
            formVariables.gameJoinDiv.style.display = "none";
            formVariables.gameopt = "create";
        };
        formVariables.radioJoin.onclick = function() {
            formVariables.gameCreateDiv.style.display = "none";
            formVariables.gameJoinDiv.style.display = "block";
            formVariables.gameopt = "join";
        };

        // When the form is submitted
        formVariables.submitButton.onclick = function(event) {
            event.preventDefault();
            if (formVariables.checkIfValidInput())
            {
                socket = io();
                // Set event listener
                socket.on("connect", function() {
                    // Hide form
                    formVariables.submitDiv.style.display = "none";
                    startExchangeWithServer();
                });
            }
        };
    },

    // Checks if entered data is valid
    checkIfValidInput: function() {
        console.log("Data taken from form are: " + formVariables);
        if (formVariables.nickName.value.length > 0)
        {
            if (formVariables.gameopt === "create")
            {
                if (formVariables.xSize.value > 0 && formVariables.ySize.value > 0 && formVariables.playernum.value >= 2)
                {
                    return true;
                }
            }
            else if (formVariables.gameopt === "join")
            {
                if (formVariables.index.value.length > 0)
                {
                    return true;
                }
            }
        }
        return false;
    },

    reset: function() {
        this.joinFailedMessage.innerHTML = "";
        this.joinFailedMessage.style.display = "none";

        this.radioCreate.checked = true;
        this.radioJoin.checked = false;

        this.gameCreateDiv.style.display = "block";
        this.gameJoinDiv.style.display = "none";
        this.gameopt = "create";

        this.xSize.value = 7;
        this.ySize.value = 7;
        this.playernum.value = 2;
        this.index.value = null;
    }
};

window.onload = formVariables.loadFormLogic;

resetPage = function () {
    socket.disconnect();
    clearWaitingMessages();
    formVariables.reset();
    formVariables.submitDiv.style.display = "block";
};

clearWaitingMessages = function () {
    var msg = document.getElementById("displayedMessage");
    if (msg != null) {
        msg.remove();
    }
};

// Waits for the number of players to be equal to the one set by game owner
waitForPlayers = () => {
    // When another player joins the same game
    socket.on("new_player", (playerInfo) => {
        console.log("New player joining game!");
        players.add(playerInfo.id, playerInfo.nickname);
        console.log(Object.keys(players.dict).length + " players have joined this game.");
        console.log("playerdict is " + players);
    });

    socket.on("player_disconnect", (id) => {
        alert("Player " + players.dict[id].nickname + " disconnected!");
        players.remove(id);
    });

    socket.on("start_game", () => {
        // TODO: Forbid new players from joining when game starts
        console.log("All " + Object.keys(players.dict).length + " players joined, starting game.");
        clearWaitingMessages();
        startGame();
    });
};

players = {
    dict: {},
    add: function (id, nickname)
    {
        this.dict[id] = {nickname: nickname, color: "red"};
    },
    remove: function (id)
    {
        if (Object.prototype.hasOwnProperty.call(this.dict, id))
            delete this.dict[id];
    }
};

startExchangeWithServer = function ()
{
    console.log("My socket id is: " +  socket.id);

    if (formVariables.gameopt === "create")
    {
        players.add(socket.id, formVariables.nickName.value);

        // Requesting server to create a new game
        socket.emit("create_request", {
            XSize: formVariables.xSize.value,
            YSize: formVariables.ySize.value,
            ownerNickname: formVariables.nickName.value,
            expectedPlayers: formVariables.playernum.value
        });

        // TODO: add case where game creation fails
        // When server finishes creating new game this displays a message as well as the created game's index
        socket.on("create_success", (gameIndex) => {
            XSize = formVariables.xSize.value;
            YSize = formVariables.ySize.value;
            var displayedMessage = {
                disp: document.createElement("div"),
                message: document.createElement("h1"),
                gameIndex: document.createElement("h3")
            };

            displayedMessage.message.innerHTML = "Waiting for other players to join";
            displayedMessage.message.style.textAlign = "center";

            displayedMessage.gameIndex.innerHTML = "Your game's index is " + gameIndex;
            displayedMessage.gameIndex.style.textAlign = "center";

            displayedMessage.disp.appendChild(displayedMessage.message);
            displayedMessage.disp.appendChild(displayedMessage.gameIndex);

            displayedMessage.disp.id = "displayedMessage";

            document.body.appendChild(displayedMessage.disp);

            waitForPlayers();
        });
    }
    else if (formVariables.gameopt === "join")
    {
        // Requesting server to join an existing game of index entered in the form
        socket.emit("join_request", {
            index: formVariables.index.value,
            nickname: formVariables.nickName.value
        });

        console.log("Joining server with index " + formVariables.index.value);

        // While joining this displays a "joining" message
        var displayedMessage = { message: document.createElement("h1") };
        displayedMessage.message.innerHTML = "Joining";
        displayedMessage.message.id = "displayedMessage";

        document.body.appendChild(displayedMessage.message);

        // When player fails to join,
        socket.on("join_failure", (reason) => {
            formVariables.joinFailedMessage.innerHTML = reason;
            formVariables.joinFailedMessage.style.display = "block";
            resetPage();
        });

        // When player successfully joins, displays a message as well as the index of the game the player is joining
        socket.on("join_success", (gameInfo) => {
            XSize = gameInfo.XSize;
            YSize = gameInfo.YSize;
            players.dict = gameInfo.playerdict;
            displayedMessage.message.innerHTML = "Waiting for other players to join";

            console.log("Number of players: " + Object.keys(gameInfo.playerdict).length);
            console.log("Joined server with index " + formVariables.index.value);
            waitForPlayers();
        });
    }
};

// Game logic starts here --------------------------------------------------->No trespassing<------------------------------------------------

// Begins the game
startGame = function () {
    socket.off("player_disconnected");
    socket.on("player_disconnected", (id) => {
        alert("Player " + players.dict[id].nickname + " disconnected!");
        myGameArea.destroy();
        resetPage();
    });

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

// Textures imported from Assets folder for the "stick" type GameComponents
stickTextures =
{
    vertical:
    {
        IDLE: "./client/assets/StickVertical.png",
        hover: "./client/assets/StickVertical_hover.png",
        yellow: "./client/assets/StickVertical_yellow.png",
        blue: "./client/assets/StickVertical_blue.png"
    },
    horizontal:
    {
        IDLE: "./client/assets/StickHorizontal.png",
        hover: "./client/assets/StickHorizontal_hover.png",
        yellow: "./client/assets/StickHorizontal_yellow.png",
        blue: "./client/assets/StickHorizontal_blue.png"
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
        stickTexturesInitiated = true;
    }
};

// Textures imported from Assets folder for the "wall segment" type GameComponents
wallTextures =
{
    top: "./client/assets/WallTop.png",
    left: "./client/assets/WallLeft.png",
    bottom: "./client/assets/WallBottom.png",
    right: "./client/assets/WallRight.png",

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
                console.log("The color of the player who is claiming is: " + players[socket.id].color);
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