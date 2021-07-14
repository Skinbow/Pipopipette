const favicon = require("serve-favicon");
const express = require("express");
const http = require("http");
const path = require("path");
const socket_io = require("socket.io");
const {
    createGame,
    deleteGame,
    getGame,
    gameExists,
    addPlayer,
    removePlayer,
    nextPlayersTurn
} = require("./gameRooms");

var app = express();
var server = http.createServer(app);
var io = socket_io(server);

app.use(favicon(path.resolve("public", "assets", "favicon.ico")));
app.get("/", (req, res) => {
    res.sendFile(path.resolve("public", "index.html"));
});
app.use(express.static(path.resolve("public")));

function broadcastPlayersTurn(gameIndex, playersTurnIndex) {
    const game = getGame(gameIndex);
    const playersTurnSocketId = Array.from(game.playerdict.keys())[playersTurnIndex];
    
    io.to(gameIndex).emit("players_turn", playersTurnSocketId);
    console.log("Broadcast to everyone that it's the turn of " + game.playerdict.get(playersTurnSocketId).nickname);
}

io.on("connection", (socket) => {
    console.log("\nThe user with the socket id " + socket.id + " connected!\n");

    // Socket recieving a request to create a new game
    socket.on("create_request", (createInfo) => {
        // Creates a new game with board size of XSize and YSize and a certain number of players
        let gameIndex = createGame(createInfo.XSize, createInfo.YSize, createInfo.expectedPlayers);

        // Adds player that created the game to the game
        addPlayer(socket, gameIndex, {
            id: socket.id,
            nickname: createInfo.ownerNickname
        });

        // Send confirmation to client
        socket.emit("create_success", gameIndex);
        console.log("Game with index " + gameIndex + " was successfully created!");
    });

    // Socket recieving request to join an existing game
    socket.on("join_request", (joinInfo) => {
        // Game does not exist
        if (!(gameExists(joinInfo.gameIndex)))
        {
            socket.emit("join_failure", "Game index not found!");
            console.log("Requested game index " + joinInfo.gameIndex + " does not exist!");
            return;
        }

        // The game the user wants to join
        let requestedGame = getGame(joinInfo.gameIndex);
        // Gets the ids of players already in the game
        let ids = requestedGame.playerdict.keys();

        // All players have already joined
        if (ids.length >= requestedGame.expectedPlayers)
        {
            socket.emit("join_failure", "Too many players at game index!");
            console.log("Too many players at game index " + joinInfo.gameIndex + "!");
            return;
        }

        // Adds joining player to requested game
        addPlayer(socket, joinInfo.gameIndex, {
            id: socket.id,
            nickname: joinInfo.nickname
        });

        // In es6 Map objects can not yet be JSON-encoded to be sent through a socket
        let gameInfoToSend = JSON.parse(JSON.stringify(requestedGame));
        gameInfoToSend.playerdict = Object.fromEntries(requestedGame.playerdict.entries());

        // Send confirmation to client
        socket.emit("join_success", gameInfoToSend);

        console.log("There are " + requestedGame.playerdict.size + " users connected to game with index " + joinInfo.gameIndex);
        
        // Notify everyone other than the player who joined that a player joined
        socket.to(socket.gameIndex).emit("new_player", {
            id: socket.id,
            nickname: joinInfo.nickname
        });
        console.log("Telling the room " + socket.gameIndex + " that the player with id " + socket.id + " has joined.");

        if (requestedGame.playerdict.size == requestedGame.expectedPlayers)
        {
            io.to(socket.gameIndex).emit("start_game");
            broadcastPlayersTurn(socket.gameIndex, 0);
        }
    });

    socket.on("claimed_stick", (stickId) => {
        socket.to(socket.gameIndex).emit("claimed_stick", stickId);
        broadcastPlayersTurn(socket.gameIndex, nextPlayersTurn(socket.gameIndex));
    });

    // TODO: make the game get deleted only if it had already started when the user left
    socket.on("disconnect", () => {
        console.assert("gameIndex" in socket, "Did not find \"gameIndex\" in socket with id " + socket.id);
        // Index of the game the player left
        let gameIndex = socket.gameIndex;
        if (gameExists(gameIndex))
        {
            // The game the user left
            let gameLeft = getGame(gameIndex);
            if (gameLeft.playerdict.size >= gameLeft.expectedPlayers)
            {
                io.to(gameIndex).emit("player_disconnected", socket.id);
                deleteGame(gameIndex);
            }
            else
            {
                removePlayer(gameIndex, socket.id);
                if (gameLeft.playerdict.size === 0) {
                    deleteGame(gameIndex);
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
// Debug, signal sent by nodemon when restarting
process.on("SIGUSR2", terminate);

server.listen(3000, () => {
    console.log("Listenting on *:3000");
});