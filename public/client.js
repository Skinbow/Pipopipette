"use strict";

(function () {
    // Functions
    let formVariables;
    /**
     * Make socket emit game creation or game join request
     * @type {function(): void}
     */
    let startExchangeWithServer;
    /**
     * Function that creates a websocket connection
     * @type {function(): void}
     */
    let createSocket;
    /**
     * Wait for remaining players to join the game
     * @type {function(): void}
     */
    let waitForPlayers;
    /**
     * When all players joined the game, remove the displayed waiting message
     * @type {function(): void}
     */
    let clearWaitingMessages;
    /**
     * Checks if the user refreshed to cancel the request
     * @type {function(): void}
     */
    let checkIfRefresh;
    /**
     * Resets the page for the user
     * @type {function(): void}
     */
    let resetPage;

    // Objects
    /**
     * @typedef playerInformation
     * @type {Object}
     * @property {String} nickname The nickname of the player
     */
    /**
     * @typedef addPlayerType
     * @type {function(String, String): void}
     * @param {String} id New player's id
     * @param {String} nickname New player's nickname
     */
    /**
     * Namespace for managing player info
     * @typedef playersNamespace
     * @type {Object}
     * @property {Map<String, playerInformation>} dict Dictionary containing players info
     * @property {String[]} availableColors Colors that can be played
     * @property {number} colorCount Counter for the color being used
     * @property {addPlayerType} addPlayer Add a new player to the dictionary
     */
    /**
     * @type {playersNamespace}
     */
    let players;

    /**
     * The client side of the socket
     * @type {Object}
     */
    let socket;

    resetPage = function () {
        if (socket != null && socket.connected)
        {
            socket.disconnect();
        }

        // clearWaitingMessages();
        // formVariables.reset();

        // formVariables.gameFormDiv.classList.remove("hidden");
        Game_MODULE.gameArea.destroy();
        window.location.href = "index.html";
    };

    clearWaitingMessages = function () {
        let msg = document.getElementById("displayedMessage");
        if (msg !== null) {
            msg.remove();
        }
    };

    checkIfRefresh = function () {
        // If the user refreshes the page, the request should be cancelled
        formVariables = JSON.parse(sessionStorage.getItem("form_variables"));

        if (formVariables === null) {
            resetPage();
        }
        else
        {
            sessionStorage.removeItem("form_variables");
            sessionStorage.setItem("nickname", formVariables.nickname);
        }
    };

    // Waits for the number of players to be equal to the one set by game owner
    waitForPlayers = function () {
        /**
         * When another player joins the same game
         *
         * @param {Object} playerInfo Info about the new player
         * @param {String} playerInfo.id Id of the new player
         * @param {String} playerInfo.nickname Nickname of the new player
         */
        const alertedNewPlayer = (playerInfo) => {
            const { id, nickname } = playerInfo;
            console.log(nickname + " is joining the game!");
            players.add(id, nickname);
            console.log(players.dict.size + " players have joined this game.");
        };

        /**
         * When another player disconnects from the game
         *
         * @param {String} id Id of the disconnected player
         */
        const alertedPlayerDisconnected = (id) => {
            resetPage();
            //alert("Player " + players.dict.get(id).nickname + " disconnected!");
        };

        /**
         * When it's a different player's turn
         *
         * @param {String} playersTurnId Id of the player whose turn it is
         */
        const alertedPlayersTurn = (playersTurnId) => {
            Game_MODULE.gameArea.setPlayersTurn(socket.id, playersTurnId, players.dict.get(playersTurnId).nickname, players.nextColor(players.dict.size));
        };

        /**
         * When a stick is claimed by a player
         * @param {number} stickId Id of the stick that was claimed
         */
        const alertedClaimedStick = (stickId) => {
            let gameArea = Game_MODULE.gameArea;
            let stick = gameArea.sticks[stickId];
            stick.claimStick(Game_MODULE.gameArea.playersTurn);
            for (let i = 0; i < stick.neighbouringSquares.length; i += 1) {
                // Trying to claim surrounding squares which get claimed if all the sticks surrounding them are active
                stick.neighbouringSquares[i].claimSquare(gameArea.playersTurn);
            }
        };

        /**
         * When the game can start, aka enough players have joined
         *
         * @type {function}
         */
        const alertedStartGame = () => {
            // TODO: Forbid new players from joining when game starts
            clearWaitingMessages();

            console.log("All " + players.dict.size + " players joined, starting game.");
            console.groupEnd("Connection details");
            console.group("Game messages");

            /**
             * Alert the server that this user has claimed a stick
             *
             * @param {String} myId Id of the player who claimed the stick, that is this player
             * @param {number} stickId Id of the stick that was claimed
             */
            const stickClaimAlertFunction = (stickId, squaresClaimed) => { socket.emit("claimed_stick", stickId, squaresClaimed); };
            Game_MODULE.startGame(socket.XSize, socket.YSize, stickClaimAlertFunction);

            socket.on("player_disconnected", alertedPlayerDisconnected);
            socket.on("players_turn", alertedPlayersTurn);
            socket.on("claimed_stick", alertedClaimedStick);
            socket.on("game_finished", (scoreboard) =>
            {
                scoreboard = JSON.parse(scoreboard);
                console.log(scoreboard);
                Game_MODULE.gameArea.destroy();

                let scoreboardDiv = document.createElement("div");
                scoreboardDiv.classList.add("centered");
                scoreboardDiv.style.width = "100%";

                let borderDiv = document.createElement("div");
                borderDiv.style.cssText += "border: 1em outset gray; width: fit-content; margin: 0 auto;";

                let scoreboardTable = document.createElement("table");
                scoreboardTable.id = "scoreboardTable";

                let scoreHeader = document.createElement("tr");
                scoreHeader.innerHTML = "<th><h3>Name</h3></th><th><h4>Score</h4></th>";
                scoreboardTable.appendChild(scoreHeader);
                for (let entry of scoreboard)
                {
                    console.log(entry);
                    const key = players.dict.get(entry[0]).nickname;
                    let scoreEntry = document.createElement("tr");
                    scoreEntry.innerHTML = "<td><h3>" + key + "</h3></td><td><h4>" + entry[1] + "</h4></td>";
                    scoreboardTable.appendChild(scoreEntry);
                }
                borderDiv.appendChild(scoreboardTable);
                scoreboardDiv.appendChild(borderDiv);

                let goBackButton = document.createElement("button");
                goBackButton.style.marginTop = "1vw";
                goBackButton.innerHTML = "Return to main page";
                goBackButton.id = "goBackButton";

                goBackButton.onclick = resetPage;
                scoreboardDiv.appendChild(goBackButton);

                document.body.appendChild(scoreboardDiv);
            });
        };

        socket.on("new_player", alertedNewPlayer);
        socket.on("start_game", alertedStartGame);
    };

    players = {
        dict: new Map(),
        availableColors: ["blue", "red", "lime", "yellow"],
        colorCount: 0,
        add: function (id, nickname)
        {
            players.dict.set(id, {
                nickname: nickname
            });
        },
        /**
         * Remove a player from the dictionary by id
         * @param {String} id Id of the player being removed
         */
        remove: function (id)
        {
            if (players.dict.has(id))
            {
                players.dict.delete(id);
            }
        },
        /**
         * Returns the next color in the available colors list
         * @param {number} playersNum Number of players in the game
         * @returns {String}
         */
        nextColor: function(playersNum)
        {
            /**
             * Color to be returned by the function
             * @type {String}
             */
            let color = players.availableColors[players.colorCount];
            players.colorCount++;
            if (players.colorCount === playersNum || players.colorCount === players.availableColors.length)
            {
                players.colorCount = 0;
            }
            return color;
        }
    };

    createSocket = function () {
        console.group("Connection details");
        socket = io();
        // Set event listeners
        socket.on("connect", startExchangeWithServer);
        socket.on("terminate", resetPage);
    };

    startExchangeWithServer = function ()
    {
        console.log("My socket id is: " + socket.id);

        if (formVariables.gameopt === "create")
        {
            players.add(socket.id, formVariables.nickname);

            // Requesting server to create a new game
            socket.emit("create_request", {
                XSize: formVariables.xSize,
                YSize: formVariables.ySize,
                ownerNickname: formVariables.nickname,
                expectedPlayers: formVariables.playernum
            });

            // TODO: add case where game creation fails
            // When server finishes creating new game this displays a message as well as the created game's index
            socket.on("create_success", (gameIndex) => {
                socket.XSize = formVariables.xSize;
                socket.YSize = formVariables.ySize;

                // Display a waiting message
                DisplayedMessage_MODULE.displayWaitingMessage("Waiting for other players to join", "Your game's index is " + gameIndex.toString());

                waitForPlayers();
            });
        }
        else if (formVariables.gameopt === "join")
        {
            // Requesting server to join an existing game of index entered in the form
            socket.emit("join_request", {
                gameIndex: formVariables.gameIndex,
                nickname: formVariables.nickname
            });

            console.log("Joining game with index " + formVariables.gameIndex);

            // While joining this displays a "joining" message
            DisplayedMessage_MODULE.displayWaitingMessage("Joining", null);

            // When player fails to join,
            socket.on("join_failure", (reason) => {
                sessionStorage.setItem("join_failure", reason);
                resetPage();
            });

            // When player successfully joins, displays a message as well as the index of the game the player is joining
            socket.on("join_success", (gameInfo) => {
                const {
                    XSize,
                    YSize,
                    playerdict//,
                    // expectedPlayers,
                    // playersTurnIndex,
                    // playersIdsList
                } = gameInfo;
                socket.XSize = XSize;
                socket.YSize = YSize;
                players.dict = new Map(Object.entries(playerdict));

                DisplayedMessage_MODULE.displayWaitingMessage("Waiting for other players to join", "This game's index is " + formVariables.gameIndex);

                console.log("Joined game with index " + formVariables.gameIndex);
                console.log("Number of players: " + players.dict.size);
                waitForPlayers();
            });
        }
    };
    

    window.onload = function ()
    {
        checkIfRefresh();
        createSocket();
    }
})();
