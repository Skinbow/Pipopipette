var Scoreboard_MODULE = (function() {
    let MODULE = {};
    let ingameScoreboardDiv;

    function hideIngameScoreboard()
    {
        ingameScoreboardDiv.classList.add("hidden");
    }

    function showIngameScoreboard()
    {
        ingameScoreboardDiv.classList.remove("hidden");
    }

    function initIngameScoreboard(scoreboard, players)
    {
        ingameScoreboardDiv = document.createElement("div");
        ingameScoreboardDiv.id = "ingameScoreboardDiv";
        ingameScoreboardDiv.classList.add("centered");
        ingameScoreboardDiv.style.cssText += "width: 70%; height: 50%; background-color: lightslategrey; z-index: 1; border: thick outset black; box-shadow: 10px 10px 11px 0px rgb(0 0 0 / 40%);";

        hideIngameScoreboard();

        let scoreboardTable = document.createElement("table");
        scoreboardTable.id = "ingameScoreboardTable";
        scoreboardTable.classList.add("centered");
        scoreboardTable.style.width = "100%";
        scoreboardTable.style.height = "100%";

        let nicknameRow = document.createElement("tr");
        nicknameRow.id = "nicknameRow";
        let scoreRow = document.createElement("tr");
        scoreRow.id = "scoreRow";

        nicknameRow.innerHTML = "<th><h3>Name</h3></th>";
        scoreRow.innerHTML = "<th><h4>Score</h4></th>";

        for (let entry of scoreboard)
        {
            const nickname = players.dict.get(entry[0]).nickname;
            const score = entry[1];
            nicknameRow.innerHTML += "<td><h3>" + nickname + "</h3></td>";
            scoreRow.innerHTML += "<td><h4>" + score + "</h4></td>";
        }
        scoreboardTable.appendChild(nicknameRow);
        scoreboardTable.appendChild(scoreRow);

        ingameScoreboardDiv.appendChild(scoreboardTable);
        document.body.appendChild(ingameScoreboardDiv);
    }

    function updateIngameScoreboard(scoreboard, players)
    {
        let nicknameRow = document.getElementById("nicknameRow");
        let scoreRow = document.getElementById("scoreRow");

        nicknameRow.innerHTML = "<th><h3>Name</h3></th>";
        scoreRow.innerHTML = "<th><h4>Score</h4></th>";

        for (let entry of scoreboard)
        {
            const nickname = players.dict.get(entry[0]).nickname;
            const score = entry[1];
            nicknameRow.innerHTML += "<td><h3>" + nickname + "</h3></td>";
            scoreRow.innerHTML += "<td><h4>" + score + "</h4></td>";
        }
    }

    function displayEndgameScoreboard(scoreboard, players, resetPageFunction)
    {
        let scoreboardDiv = document.createElement("div");
        scoreboardDiv.classList.add("centered");
        scoreboardDiv.style.width = "100%";

        let borderDiv = document.createElement("div");
        borderDiv.style.cssText += "border: 1em outset gray; width: 80%; margin: 0 auto;";

        let scoreboardTable = document.createElement("table");
        scoreboardTable.id = "endgameScoreboardTable";
        scoreboardTable.style.width = "100%";

        let scoreHeader = document.createElement("tr");
        scoreHeader.innerHTML = "<th><h3>Name</h3></th><th><h4>Score</h4></th>";
        scoreboardTable.appendChild(scoreHeader);
        for (let entry of scoreboard)
        {
            const key = players.dict.get(entry[0]).nickname;
            let scoreEntry = document.createElement("tr");
            scoreEntry.innerHTML = "<td><h3>" + key + "</h3></td><td><h4>" + entry[1] + "</h4></td>";
            scoreboardTable.appendChild(scoreEntry);
        }
        borderDiv.appendChild(scoreboardTable);
        scoreboardDiv.appendChild(borderDiv);

        let backToMainMenuButton = document.createElement("button");
        backToMainMenuButton.innerHTML = "Return to main page";
        backToMainMenuButton.id = "backToMainMenuButton";

        backToMainMenuButton.onclick = resetPageFunction;
        scoreboardDiv.appendChild(backToMainMenuButton);

        document.body.appendChild(scoreboardDiv);
    }

    MODULE.showIngameScoreboard = showIngameScoreboard;
    MODULE.hideIngameScoreboard = hideIngameScoreboard;
    MODULE.initIngameScoreboard = initIngameScoreboard;
    MODULE.updateIngameScoreboard = updateIngameScoreboard;
    MODULE.displayEndgameScoreboard = displayEndgameScoreboard;
    return MODULE;
})();
