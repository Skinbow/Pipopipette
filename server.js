var express = require("express");
const { join } = require("path");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/lib/client/index.html");
});
app.get("/client.js", (req, res) => {
    res.sendFile(__dirname + "/lib/client/client.js");
});
app.use("/client", express.static("lib/client/"));

var games = {
    gamesList: {},
    activePlayersList: {},
    createGame: function (BoardX, BoardY, playerNum)
    {
        var tryIndex = 0;
        while (tryIndex in this.gamesList)
        {
            tryIndex++;
        }

        this.gamesList[tryIndex] = {
            XSize: BoardX,
            YSize: BoardY,
            playerdict: {},
            expectedPlayers: playerNum
        };

        return tryIndex;
    },
    deleteGame: function (gameIndex)
    {
        delete this.gamesList[gameIndex];
    },
    addPlayer: function (gameIndex, playerInfo)
    {
        this.gamesList[gameIndex].playerdict[playerInfo.id] = {nickname: playerInfo.nickname, color: "red"};
        this.activePlayersList[playerInfo.id] = gameIndex;
    },
    removePlayer: function (gameIndex, playerId)
    {
        if (Object.prototype.hasOwnProperty.call(this.gamesList[gameIndex].playerdict, playerId))
            delete this.gamesList[gameIndex].playerdict[playerId];
        if (Object.prototype.hasOwnProperty.call(this.activePlayersList, playerId))
            delete this.activePlayersList[playerId];
    }
};

io.on("connection", (socket) => {
    console.log("A user connected!");

    // Socket recieving a request to create a new game
    socket.on("create_request", (createInfo) => {
        // Creates a new game with board size of XSize and YSize
        var gameIndex = games.createGame(createInfo.XSize, createInfo.YSize, createInfo.expectedPlayers);
        // Adds player that creaates the game to the game
        games.addPlayer(gameIndex, {
            id: socket.id,
            nickname: createInfo.ownerNickname
        });
        // Send confirmation to client
        socket.emit("create_success", gameIndex);
    });

    // Socket recieving request to join an existing game
    socket.on("join_request", (joinInfo) => {
        console.log(Object.keys(games.gamesList[joinInfo.index].playerdict).length);
        if (!(joinInfo.index in games.gamesList))
        {
            socket.emit("join_failure", "Game index not found!");
            console.log("Requested game index " + joinInfo.index + " does not exist!");
            return;
        }
        if (Object.keys(games.gamesList[joinInfo.index].playerdict).length == games.gamesList[joinInfo.index].expectedPlayers)
        {
            socket.emit("join_failure", "Too many players at game index!");
            console.log("Too many players at game index " + joinInfo.index + "!");
            return;
        }
        console.log("The player dictionary of the requested game of index " + joinInfo.index + " is\n" + games.gamesList[joinInfo.index].playerdict);

        // Adds joining player to requested game
        games.addPlayer(joinInfo.index, {
            id: socket.id,
            nickname: joinInfo.nickname
        });
        socket.emit("join_success", games.gamesList[joinInfo.index]);
        
        // Gets the ids of players already in the game
        var ids = Object.keys(games.gamesList[joinInfo.index].playerdict);
        // Notify everyone other than the player who joined that a player joined
        for (var id of ids)
        {
            if (id != socket.id)
            {
                console.log(games.gamesList[joinInfo.index].playerdict[id].nickname);
                io.sockets.connected[id].emit("new_player", {
                    id: socket.id,
                    nickname: joinInfo.nickname
                });
            }
        }

        if (ids.length >= games.gamesList[joinInfo.index].expectedPlayers)
        {
            for (id of ids)
            {
                io.sockets.connected[id].emit("start_game", {
                    id: socket.id,
                    nickname: joinInfo.nickname
                });
            }
        }

        console.log("The dictionary after a player was added is: " + games.gamesList[joinInfo.index].playerdict);
    });

    // TODO: make the game get deleted only if it had already started when the user left
    socket.on("disconnect", () => {
        if (socket.id in games.activePlayersList)
        {
            // Index of the game the player left
            var gameIndex = games.activePlayersList[socket.id];
            if (Object.keys(games.gamesList[gameIndex].playerdict).length >= games.gamesList[gameIndex].expectedPlayers)
            {
                for (var player in games.gamesList[gameIndex].playerdict)
                {
                    if (player != socket.id)
                    {
                        io.sockets.connected[player].emit("player_disconnected", socket.id);
                    }
                    games.removePlayer(gameIndex, player);
                }
                games.deleteGame(gameIndex);
            }
            else
            {
                for (player in games.gamesList[gameIndex].playerdict)
                {
                    if (player != socket.id)
                    {
                        io.sockets.connected[player].emit("player_disconnected", socket.id);
                    }
                }
                games.removePlayer(gameIndex, player);

                if (Object.keys(games.gamesList[gameIndex].playerdict).length == 0)
                {
                    games.deleteGame(gameIndex);
                }
            }
        }
        console.log("User with socket id " + socket.id + " disconnected");
    });
});

http.listen(3000, () => {
    console.log("Listenting on *:3000");
});