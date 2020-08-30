var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/lib/client/index.html");
});
app.use("/client", express.static("lib/client/"));

var games = {
    gamesList: {},
    createGame: function (BoardX, BoardY)
    {
        var tryIndex = 0;
        while (tryIndex in this.gamesList)
        {
            tryIndex++;
        }

        this.gamesList[tryIndex] = {
            XSize: BoardX,
            YSize: BoardY,
            playerdict: {}
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
    }
};

io.on("connection", (socket) => {
    console.log("A user connected!");

    socket.on("create", (createData) => {
        var gameIndex = games.createGame(createData.XSize, createData.YSize);
        games.addPlayer(gameIndex, {
            id: socket.id,
            nickname: createData.ownerNickname
        });
    });

    socket.on("joining", (joiningInfo) => {
        if (!(joiningInfo.index in games.gamesList))
        {
            console.log("Such a game index does not exist!");
            return;
        }
        console.log(games.gamesList[joiningInfo.index].playerdict);

        games.addPlayer(joiningInfo.index, {
            id: socket.id,
            nickname: joiningInfo.nickname
        });
        socket.emit("gameInfo", games.gamesList[joiningInfo.index]);
        
        var ids = Object.keys(games.gamesList[joiningInfo.index].playerdict);
        for (var id of ids)
        {
            if (id != socket.id)
            {
                io.to(id).emit("joined", {
                    id: socket.id,
                    nickname: joiningInfo.nickname
                });
            }
        }

        console.log(games.gamesList[joiningInfo.index].playerdict);
    });

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});

http.listen(3000, () => {
    console.log("Listenting on *:3000");
});