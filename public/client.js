"use strict";

(function () {
    // Functions
    // Make socket emit game creation or game join request
    let startExchangeWithServer;
    // Wait for remaining players to join the game
    let waitForPlayers;
    // When all players joined the game, remove the displayed waiting message
    let clearWaitingMessages;
    // Resets the page for the user
    let resetPage;

    // Objects
    let players;

    let socket;
    let formVariables;

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
        gameIndex: document.getElementById("gameIndex"),

        submitDiv: document.getElementById("submitDiv"),
        submitButton: document.getElementById("submitButton"),

        joinFailedMessage: document.getElementById("joinFailedMessage"),

        loadFormLogic: function() {
            // Show or hide game joining and creating fields (the two of them should not show at the same time)
            formVariables.radioCreate.onclick = function() {
                formVariables.gameCreateDiv.classList.remove("hidden");
                formVariables.gameJoinDiv.classList.add("hidden");
                formVariables.gameopt = "create";
            };
            formVariables.radioJoin.onclick = function() {
                formVariables.gameCreateDiv.classList.add("hidden");
                formVariables.gameJoinDiv.classList.remove("hidden");
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
                        formVariables.submitDiv.classList.add("hidden");
                        startExchangeWithServer();
                    });
                    socket.on("terminate", function () {
                        resetPage();
                    });
                }
            };
        },

        // Checks if entered data is valid
        checkIfValidInput: function() {
            if (formVariables.nickName.value.length > 0 && parseInt(formVariables.xSize.value) > 1 && parseInt(formVariables.ySize.value) > 1)
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
                    if (formVariables.gameIndex.value.length > 0)
                    {
                        return true;
                    }
                }
            }
            return false;
        },

        reset: function() {
            this.joinFailedMessage.innerHTML = "";
            this.joinFailedMessage.classList.add("hidden");

            this.radioCreate.checked = true;
            this.radioJoin.checked = false;

            this.gameCreateDiv.classList.remove("hidden");
            this.gameJoinDiv.classList.add("hidden");
            this.gameopt = "create";

            this.xSize.value = 7;
            this.ySize.value = 7;
            this.playernum.value = 2;
            this.gameIndex.value = null;
        }
    };

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
            clearWaitingMessages();

            socket.off("player_disconnected");
            socket.on("player_disconnected", (id) => {
                alert("Player " + players.dict[id].nickname + " disconnected!");
                Game_MODULE.myGameArea.destroy();
                resetPage();
            });

            Game_MODULE.startGame(socket.XSize, socket.YSize);
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
                socket.XSize = formVariables.xSize.value;
                socket.YSize = formVariables.ySize.value;
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
                gameIndex: formVariables.gameIndex.value,
                nickname: formVariables.nickName.value
            });

            console.log("Joining game with index " + formVariables.gameIndex.value);

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
                socket.XSize = gameInfo.XSize;
                socket.YSize = gameInfo.YSize;
                players.dict = gameInfo.playerdict;
                displayedMessage.message.innerHTML = "Waiting for other players to join";

                console.log("Number of players: " + Object.keys(gameInfo.playerdict).length);
                console.log("Joined game with index " + formVariables.gameIndex.value);
                waitForPlayers();
            });
        }
    };
    window.onload = formVariables.loadFormLogic;
})();