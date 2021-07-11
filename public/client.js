"use strict";

(function () {
    // Functions
    // Make socket emit game creation or game join request
    let startExchangeWithServer;
    // Function that creates a websocket connection
    let createSocket;
    // Wait for remaining players to join the game
    let waitForPlayers;
    // When all players joined the game, remove the displayed waiting message
    let clearWaitingMessages;
    // Resets the page for the user
    let resetPage;

    // Objects
    let players;

    let socket;
    
    resetPage = function () {
        socket.disconnect();
        // clearWaitingMessages();
        // formVariables.reset();
        
        // formVariables.submitDiv.classList.remove("hidden");
        document.location.reload();
    };

    clearWaitingMessages = function () {
        let msg = document.getElementById("displayedMessage");
        if (msg !== null) {
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
        });

        socket.on("start_game", () => {
            // TODO: Forbid new players from joining when game starts
            console.log("All " + Object.keys(players.dict).length + " players joined, starting game.");
            console.groupEnd("Connection details");
            clearWaitingMessages();

            console.group("Game messages");

            socket.off("player_disconnected");
            socket.on("player_disconnected", (id) => {
                alert("Player " + players.dict[id].nickname + " disconnected!");
                Game_MODULE.gameArea.destroy();
                resetPage();
            });

            let stickClaimAlertFunction = function (tryingOwnerId, stickId) {
                socket.emit("claimed_stick", tryingOwnerId, stickId);
            };
            Game_MODULE.startGame(socket.XSize, socket.YSize, stickClaimAlertFunction);
            
            socket.on("players_turn", (playersTurnId) => {
                Game_MODULE.gameArea.setPlayersTurn(socket.id, playersTurnId, players.dict[playersTurnId].nickname, players.nextColor());
            });

            socket.on("claimed_stick", (tryingOwnerId, stickId) => {
                let gameArea = Game_MODULE.gameArea;
                let stick = gameArea.sticks[stickId];
                stick.claimStick(Game_MODULE.gameArea.playersTurn, null);
                for (let i = 0; i < stick.neighbouringSquares.length; i += 1) {
                    // Trying to claim surrounding squares which get claimed if all the sticks surrounding them are active
                    stick.neighbouringSquares[i].claimSquare(gameArea.playersTurn);
                }
            });
        });
    };

    players = {
        dict: {},
        availableColors: ["blue", "red", "green", "yellow"],
        colorCount: 0,
        add: function (id, nickname)
        {
            this.dict[id] = {nickname: nickname};
        },
        remove: function (id)
        {
            if (Object.prototype.hasOwnProperty.call(this.dict, id))
                delete this.dict[id];
        },
        nextColor: function()
        {
            let color = this.availableColors[this.colorCount];
            this.colorCount++;
            if (this.colorCount === this.availableColors.length)
                this.colorCount = 0;
            return color;
        }
    };

    createSocket = function () {
        console.group("Connection details");
        socket = io();
        // Set event listener
        socket.on("connect", function() {
            startExchangeWithServer();
        });
        socket.on("terminate", function () {
            resetPage();
        });
    };

    startExchangeWithServer = function ()
    {
        console.log("My socket id is: " + socket.id);

        if (Form_MODULE.formVariables.gameopt === "create")
        {
            players.add(socket.id, Form_MODULE.formVariables.nickName.value);

            // Requesting server to create a new game
            socket.emit("create_request", {
                XSize: Form_MODULE.formVariables.xSize.value,
                YSize: Form_MODULE.formVariables.ySize.value,
                ownerNickname: Form_MODULE.formVariables.nickName.value,
                expectedPlayers: Form_MODULE.formVariables.playernum.value
            });

            // TODO: add case where game creation fails
            // When server finishes creating new game this displays a message as well as the created game's index
            socket.on("create_success", (gameIndex) => {
                socket.XSize = Form_MODULE.formVariables.xSize.value;
                socket.YSize = Form_MODULE.formVariables.ySize.value;
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
        else if (Form_MODULE.formVariables.gameopt === "join")
        {
            // Requesting server to join an existing game of index entered in the form
            socket.emit("join_request", {
                gameIndex: Form_MODULE.formVariables.gameIndex.value,
                nickname: Form_MODULE.formVariables.nickName.value
            });

            console.log("Joining game with index " + Form_MODULE.formVariables.gameIndex.value);

            // While joining this displays a "joining" message
            var displayedMessage = { message: document.createElement("h1") };
            displayedMessage.message.innerHTML = "Joining";
            displayedMessage.message.id = "displayedMessage";

            document.body.appendChild(displayedMessage.message);

            // When player fails to join,
            socket.on("join_failure", (reason) => {
                Form_MODULE.formVariables.joinFailedMessage.innerHTML = reason;
                Form_MODULE.formVariables.joinFailedMessage.style.display = "block";
                resetPage();
            });

            // When player successfully joins, displays a message as well as the index of the game the player is joining
            socket.on("join_success", (gameInfo) => {
                socket.XSize = gameInfo.XSize;
                socket.YSize = gameInfo.YSize;
                players.dict = gameInfo.playerdict;
                displayedMessage.message.innerHTML = "Waiting for other players to join";

                console.log("Joined game with index " + Form_MODULE.formVariables.gameIndex.value);
                console.log("Number of players: " + Object.keys(gameInfo.playerdict).length);
                waitForPlayers();
            });
        }
    };
    window.onload = function () { Form_MODULE.formVariables.loadFormLogic(createSocket); };
})();