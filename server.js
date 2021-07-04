var express = require("express");
const { join } = require("path");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});
app.use("/public", express.static("public"));

var games;
var generateGameIndex;

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
            expectedPlayers: playerNum
        };

        return gameIndex;
    },
    deleteGame: function (gameIndex)
    {
        // for (let player in this.gamesList[gameIndex].playerdict)
        // {
        //     delete this.activePlayersList[player]
        // }
        delete this.gamesList[gameIndex];
    },
    addPlayer: function (socket, gameIndex, playerInfo)
    {
        this.gamesList[gameIndex].playerdict[playerInfo.id] = {nickname: playerInfo.nickname, color: "red"};
        socket.gameIndex = gameIndex;
    },
    removePlayer: function (socket, gameIndex, playerId)
    {
        if (Object.prototype.hasOwnProperty.call(this.gamesList[gameIndex].playerdict, playerId))
            delete this.gamesList[gameIndex].playerdict[playerId];
        if (Object.prototype.hasOwnProperty.call(socket, gameIndex))
            delete socket.gameIndex;
    }
};

io.on("connection", (socket) => {
    console.log("The user with the socket id " + socket.id + " connected!");

    // Socket recieving a request to create a new game
    socket.on("create_request", (createInfo) => {
        // Creates a new game with board size of XSize and YSize
        let gameIndex = games.createGame(createInfo.XSize, createInfo.YSize, createInfo.expectedPlayers);
        // Adds player that creaates the game to the game
        games.addPlayer(socket, gameIndex, {
            id: socket.id,
            nickname: createInfo.ownerNickname
        });
        // Send confirmation to client
        socket.emit("create_success", gameIndex);
        socket.gameIndex = gameIndex;
    });

    // Socket recieving request to join an existing game
    socket.on("join_request", (joinInfo) => {
        if (!(joinInfo.gameIndex in games.gamesList))
        {
            socket.emit("join_failure", "Game index not found!");
            console.log("Requested game index " + joinInfo.gameIndex + " does not exist!");
            return;
        }
        if (Object.keys(games.gamesList[joinInfo.gameIndex].playerdict).length === games.gamesList[joinInfo.gameIndex].expectedPlayers)
        {
            socket.emit("join_failure", "Too many players at game index!");
            console.log("Too many players at game index " + joinInfo.gameIndex + "!");
            return;
        }
        // console.log("The player dictionary of the requested game of index " + joinInfo.index + " is\n" + games.gamesList[joinInfo.index].playerdict);

        // Adds joining player to requested game
        games.addPlayer(socket, joinInfo.gameIndex, {
            id: socket.id,
            nickname: joinInfo.nickname
        });
        console.log("There are " + Object.keys(games.gamesList[joinInfo.gameIndex].playerdict).length + " users connected to game with index " + joinInfo.gameIndex);
        socket.emit("join_success", games.gamesList[joinInfo.gameIndex]);
        
        // Gets the ids of players already in the game
        let ids = Object.keys(games.gamesList[joinInfo.gameIndex].playerdict);
        // Notify everyone other than the player who joined that a player joined
        for (let id of ids)
        {
            if (id !== socket.id)
            {
                console.log("Telling " + games.gamesList[joinInfo.gameIndex].playerdict[id].nickname + " that the player with id " + socket.id + " has joined.");
                io.sockets.connected[id].emit("new_player", {
                    id: socket.id,
                    nickname: joinInfo.nickname
                });
            }
        }

        if (ids.length >= games.gamesList[joinInfo.gameIndex].expectedPlayers)
        {
            for (let id of ids)
            {
                io.sockets.connected[id].emit("start_game", {
                    id: socket.id,
                    nickname: joinInfo.nickname
                });
            }
        }

        // console.log("The dictionary after a player was added is: " + games.gamesList[joinInfo.index].playerdict);
    });

    // TODO: make the game get deleted only if it had already started when the user left
    socket.on("disconnect", () => {
        if ("gameIndex" in socket)
        {
            // Index of the game the player left
            let gameIndex = socket.gameIndex;
            if (gameIndex in games.gamesList)
            {
                if (Object.keys(games.gamesList[gameIndex].playerdict).length >= games.gamesList[gameIndex].expectedPlayers)
                {
                    for (let player in games.gamesList[gameIndex].playerdict)
                    {
                        if (player !== socket.id)
                        {
                            io.of("/").to(player).emit("player_disconnected", socket.id);
                        }
                        games.removePlayer(socket, gameIndex, player);
                    }
                    games.deleteGame(gameIndex);
                }
                else
                {
                    games.removePlayer(socket, gameIndex, socket.id);
                    if (games.gamesList[gameIndex].playerdict.length === 0) {
                        games.deleteGame(gameIndex);
                    }
                    // for (let player in games.gamesList[gameIndex].playerdict)
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
        console.log("User with socket id " + socket.id + " disconnected");
    });
});

var terminate = () => {
    io.emit("terminate");
};

process.on("SIGTERM", terminate);
process.on("SIGINT", terminate);

http.listen(3000, () => {
    console.log("Listenting on *:3000");
});