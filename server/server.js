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
    gameIsFull,
    gameIsEmpty,
    addPlayer,
    removePlayer,
    nextPlayersTurn,
    getPlayersTurn,
    addToScore,
    getScoreboard,
    gameIsFinished,
    initShuffledPlayersIds
} = require("./gameRooms");

var app = express();
var server = http.createServer(app);
var io = socket_io(server);

app.use(favicon(path.resolve("public", "assets", "favicon.ico")));
app.get("/", (req, res) => {
    res.sendFile(path.resolve("public", "index.html"));
});
app.use(express.static(path.resolve("public")));

function checkIfValidJoin(socket, gameIndex) {
    // Game does not exist
    if (!(gameExists(gameIndex)))
    {
        socket.emit("join_failure", "Game index not found!");
        console.log("Requested game index " + gameIndex + " does not exist!");
        return false;
    }

    // All players have already joined
    if (gameIsFull(gameIndex))
    {
        socket.emit("join_failure", "That game is full!");
        console.log("Too many players at game index " + gameIndex + "!");
        return false;
    }

    return true;
}

function sendGameInfo(socket, gameIndex) {
    // The game the user wants to join
    let requestedGame = getGame(gameIndex);

    // In es6 Map objects can not yet be JSON-encoded to be sent through a socket
    let gameInfoToSend = JSON.parse(JSON.stringify(requestedGame));
    gameInfoToSend.playerdict = Object.fromEntries(requestedGame.playerdict.entries());

    // Send confirmation to client
    socket.emit("join_success", gameInfoToSend);
    console.log("There are " + requestedGame.playerdict.size + " users connected to game with index " + gameIndex);
}

function broadcastPlayersTurn(gameIndex, playersTurnIndex) {
    const game = getGame(gameIndex);
    const playersTurnSocketId = game.playersIdsList[playersTurnIndex];
    
    io.to(gameIndex).emit("players_turn", playersTurnSocketId);
    // console.log("Broadcast to everyone that it's the turn of " + game.playerdict.get(playersTurnSocketId).nickname);
}

io.on("connection", (socket) => {
    console.log("\nThe user with the socket id " + socket.id + " connected!\n");

    // Socket recieving a request to create a new game
    socket.on("create_request", (createInfo) => {
        const {
            XSize,
            YSize,
            ownerNickname,
            expectedPlayers
        } = createInfo;

        // Creates a new game with board size of XSize and YSize and a certain number of players
        let gameIndex = createGame(parseInt(XSize), parseInt(YSize), parseInt(expectedPlayers));

        // Adds player that created the game to the game
        addPlayer(socket, gameIndex, ownerNickname);

        // Send confirmation to client
        socket.emit("create_success", gameIndex);
        console.log("Game with index " + gameIndex + " was successfully created!");
    });

    // Socket recieving request to join an existing game
    socket.on("join_request", (joinInfo) => {
        const {
            gameIndex,
            nickname
        } = joinInfo;
        
        if (!(checkIfValidJoin(socket, gameIndex))) return;

        // Adds joining player to requested game
        addPlayer(socket, gameIndex, nickname);
        // Sends game info to the new player
        sendGameInfo(socket, gameIndex);

        // Notify everyone other than the player who joined that a player joined
        socket.to(gameIndex).emit("new_player", {
            id: socket.id,
            nickname: nickname
        });
        console.log("Telling the room " + gameIndex + " that the player with id " + socket.id + " has joined.");

        if (gameIsFull(gameIndex))
        {
            io.to(gameIndex).emit("start_game");

            initShuffledPlayersIds(gameIndex);
            broadcastPlayersTurn(gameIndex, getPlayersTurn(gameIndex));
        }
    });

    socket.on("claimed_stick", (stickId, squaresClaimed) => {
        const gameIndex = socket.gameIndex;
        // Broadcast claimed stick
        socket.to(gameIndex).emit("claimed_stick", stickId);

        addToScore(gameIndex, getPlayersTurn(gameIndex), parseInt(squaresClaimed));
        if (gameIsFinished(gameIndex))
        {
            let scoreboard = getScoreboard(gameIndex);
            console.table(scoreboard);
            io.to(gameIndex).emit("game_finished", JSON.stringify(scoreboard));
            deleteGame(gameIndex);
        }
        else
        {
            // Broadcast player's turn
            broadcastPlayersTurn(gameIndex, nextPlayersTurn(gameIndex));
        }
    });

    // TODO: make the game get deleted only if it had already started when the user left
    socket.on("disconnect", () => {
        console.assert("gameIndex" in socket, "Did not find \"gameIndex\" in socket with id " + socket.id);
        // Index of the game the player left
        let gameIndex = socket.gameIndex;
        if (gameExists(gameIndex))
        {
            if (!gameIsFinished(gameIndex))
            {
                // When the game was full, there is no other choice but to delete the game
                if (gameIsFull(gameIndex))
                {
                    io.to(gameIndex).emit("player_disconnected", socket.id);
                    deleteGame(gameIndex);
                }
                // When the game is not full, we can just remove the disconnected player
                else
                {
                    removePlayer(gameIndex, socket.id);
                    if (gameIsEmpty(gameIndex)) {
                        deleteGame(gameIndex);
                    }
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