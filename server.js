var express = require("express");
const { join } = require("path");
var app = express();
var http = require("http").createServer(app);
var favicon = require("serve-favicon");
var io = require("socket.io")(http);

app.use(favicon(__dirname + "/public/assets/favicon.ico"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});
app.use("/public", express.static("public"));

var games;
var generateGameIndex;
var manageGame;
var broadcastPlayersTurn;

generateGameIndex = () => {
    let tryIndex = 0;
    while (tryIndex in games.gamesList)
    {
        tryIndex++;
    }
    return tryIndex;
};

games = {
    gamesList: {},
    createGame: function (BoardX, BoardY, playerNum)
    {
        let gameIndex = generateGameIndex();

        this.gamesList[gameIndex] = {
            XSize: BoardX,
            YSize: BoardY,
            playerdict: {},
            expectedPlayers: playerNum,
            playerSockets: []
        };

        return gameIndex;
    },
    deleteGame: function (gameIndex)
    {
        console.log("Deleting game with index " + gameIndex);
        delete this.gamesList[gameIndex];
    },
    addPlayer: function (socket, gameIndex, playerInfo)
    {
        this.gamesList[gameIndex].playerdict[playerInfo.id] = {nickname: playerInfo.nickname};
        socket.gameIndex = gameIndex;
    },
    removePlayer: function (gameIndex, playerId)
    {
        if (Object.prototype.hasOwnProperty.call(this.gamesList[gameIndex].playerdict, playerId))
            delete this.gamesList[gameIndex].playerdict[playerId];
    },
    getPlayersSockets: function (gameIndex)
    {
        let shuffle = function (array) {
            var currentIndex = array.length,  randomIndex;
        
            // While there remain elements to shuffle...
            while (0 !== currentIndex) {
                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;
        
                // And swap it with the current element.
                [array[currentIndex], array[randomIndex]] = [
                    array[randomIndex], array[currentIndex]];
            }
            return array;
        };

        let game = games.gamesList[gameIndex];
        for (let i = 0; i < game.expectedPlayers; i++)
        {
            game.playerSockets[i] = io.sockets.connected[Object.keys(game.playerdict)[i]];
        }

        // Shuffling to determine playing order
        shuffle(game.playerSockets);
    }
};

broadcastPlayersTurn = function (game, playersTurnIndex) {
    for (let i = 0; i < game.expectedPlayers; i++)
    {
        let socket = game.playerSockets[i];
        socket.emit("players_turn", game.playerSockets[playersTurnIndex].id);
        console.log("Sent to " + socket.id + " that it's the turn of " + game.playerSockets[playersTurnIndex].id);
    }
};

manageGame = function (gameIndex) {
    let gameToManage = games.gamesList[gameIndex];
    games.getPlayersSockets(gameIndex);

    let playersTurnIndex = 0;
    broadcastPlayersTurn(gameToManage, playersTurnIndex);
    
    for (let i = 0; i < gameToManage.expectedPlayers; i++)
    {
        let socket = gameToManage.playerSockets[i];

        socket.on("claimed_stick", (tryingOwnerId, stickId) => {
            for (let otherSocket of gameToManage.playerSockets)
            {
                if (otherSocket.id !== socket.id)
                {
                    otherSocket.emit("claimed_stick", tryingOwnerId, stickId);
                }
            }
            if (++playersTurnIndex >= gameToManage.expectedPlayers)
                playersTurnIndex = 0;
            broadcastPlayersTurn(gameToManage, playersTurnIndex);
        });
    }
};

io.on("connection", (socket) => {
    console.log("\nThe user with the socket id " + socket.id + " connected!\n");

    // Socket recieving a request to create a new game
    socket.on("create_request", (createInfo) => {
        // Creates a new game with board size of XSize and YSize and a certain number of players
        let gameIndex = games.createGame(createInfo.XSize, createInfo.YSize, createInfo.expectedPlayers);
        // Adds player that created the game to the game
        games.addPlayer(socket, gameIndex, {
            id: socket.id,
            nickname: createInfo.ownerNickname
        });
        socket.gameIndex = gameIndex;

        // Send confirmation to client
        socket.emit("create_success", gameIndex);
        console.log("Game with index " + gameIndex + " was successfully created!");
    });

    // Socket recieving request to join an existing game
    socket.on("join_request", (joinInfo) => {
        // Game does not exist
        if (!(joinInfo.gameIndex in games.gamesList))
        {
            socket.emit("join_failure", "Game index not found!");
            console.log("Requested game index " + joinInfo.gameIndex + " does not exist!");
            return;
        }

        // The game the user wants to join
        let requestedGame = games.gamesList[joinInfo.gameIndex];
        // Gets the ids of players already in the game
        let ids = Object.keys(requestedGame.playerdict);

        // All players have already joined
        if (ids.length >= requestedGame.expectedPlayers)
        {
            socket.emit("join_failure", "Too many players at game index!");
            console.log("Too many players at game index " + joinInfo.gameIndex + "!");
            return;
        }

        // Adds joining player to requested game
        games.addPlayer(socket, joinInfo.gameIndex, {
            id: socket.id,
            nickname: joinInfo.nickname
        });
        socket.gameIndex = joinInfo.gameIndex;

        // Send confirmation to client
        socket.emit("join_success", requestedGame);
        console.log("There are " + Object.keys(requestedGame.playerdict).length + " users connected to game with index " + joinInfo.gameIndex);
        
        // Notify everyone other than the player who joined that a player joined
        for (let id of ids)
        {
            console.log("Telling " + id + " that the player with id " + socket.id + " has joined.");
            io.sockets.connected[id].emit("new_player", {
                id: socket.id,
                nickname: joinInfo.nickname
            });
        }

        // We added a player so we need to update ids to the actual playerdict
        ids = Object.keys(requestedGame.playerdict);
        if (ids.length >= requestedGame.expectedPlayers)
        {
            for (let id of ids)
            {
                io.sockets.connected[id].emit("start_game", {
                    id: socket.id,
                    nickname: joinInfo.nickname
                });
            }
            manageGame(socket.gameIndex);
        }
    });

    // TODO: make the game get deleted only if it had already started when the user left
    socket.on("disconnect", () => {
        if ("gameIndex" in socket)
        {
            // Index of the game the player left
            let gameIndex = socket.gameIndex;
            if (gameIndex in games.gamesList)
            {
                // The game the user left
                let gameLeft = games.gamesList[gameIndex];
                if (Object.keys(gameLeft.playerdict).length >= gameLeft.expectedPlayers)
                {
                    for (let player in gameLeft.playerdict)
                    {
                        if (player !== socket.id)
                        {
                            io.of("/").to(player).emit("player_disconnected", socket.id);
                        }
                        games.removePlayer(gameIndex, player);
                    }
                    games.deleteGame(gameIndex);
                }
                else
                {
                    games.removePlayer(gameIndex, socket.id);
                    if (Object.keys(gameLeft.playerdict).length === 0) {
                        games.deleteGame(gameIndex);
                    }
                    // for (let player in gameLeft.playerdict)
                    // {
                    //     if (player !== socket.id)
                    //     {
                    //         io.sockets.connected[player].emit("player_disconnected", socket.id);
                    //     }
                    //     games.removePlayer(socket, gameIndex, player);
                    // }
                    
                    // games.deleteGame(gameIndex);
                }
            }
        }
        console.log("\nUser with socket id " + socket.id + " disconnected!\n");
    });
});

var terminate = () => {
    io.emit("terminate");
    process.exit(1);
};

process.on("SIGTERM", terminate);
process.on("SIGINT", terminate);
// Debug
process.on("SIGUSR2", terminate);

http.listen(3000, () => {
    console.log("Listenting on *:3000");
});