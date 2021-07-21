"use strict";

(function () {
    let formVariables;
    let scoreboard;

    function isMobileDevice() {
        var check = false;
        // eslint-disable-next-line curly, space-before-blocks, keyword-spacing, space-infix-ops, no-useless-escape, comma-spacing
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    }
    const mobile = isMobileDevice();
    // Functions
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
        const alertedClaimedStick = (stickId, scoreboardIn) => {
            let gameArea = Game_MODULE.gameArea;
            let stick = gameArea.sticks[stickId];
            if (stick.claimStick(Game_MODULE.gameArea.playersTurn))
            {
                for (let i = 0; i < stick.neighbouringSquares.length; i += 1) {
                    // Trying to claim surrounding squares which get claimed if all the sticks surrounding them are active
                    stick.neighbouringSquares[i].claimSquare(gameArea.playersTurn);
                }
            }
            scoreboard = JSON.parse(scoreboardIn);
            Scoreboard_MODULE.updateIngameScoreboard(scoreboard, players);
        };

        /**
         * When the game can start, aka enough players have joined
         *
         * @type {function}
         */
        const alertedStartGame = (scoreboardIn) => {
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

            scoreboard = JSON.parse(scoreboardIn);
            Scoreboard_MODULE.initIngameScoreboard(scoreboard, players);
            console.table(scoreboard);
            if (!mobile)
            {
                document.getElementById("hintTab").classList.remove("hidden");
            }

            socket.on("player_disconnected", alertedPlayerDisconnected);
            socket.on("players_turn", alertedPlayersTurn);
            socket.on("claimed_stick", alertedClaimedStick);
            socket.on("game_finished", () =>
            {
                Scoreboard_MODULE.hideIngameScoreboard();
                document.getElementById("hintTab").classList.add("hidden");

                Game_MODULE.gameArea.destroy();

                Scoreboard_MODULE.displayEndgameScoreboard(scoreboard, players, resetPage);

                document.onkeydown = null;
                document.onkeyup = function (e)
                {
                    if (e.key === "Enter")
                    {
                        e.preventDefault();
                        resetPage();
                    }
                };
            });

            document.onkeydown = function (e)
            {
                if (e.key === "Tab")
                {
                    e.preventDefault();
                    Scoreboard_MODULE.showIngameScoreboard();
                    document.getElementById("hintTab").classList.add("hidden");
                }
            };

            document.onkeyup = function (e)
            {
                if (e.key === "Tab")
                {
                    e.preventDefault();
                    Scoreboard_MODULE.hideIngameScoreboard();
                }
            };
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
    };
})();
