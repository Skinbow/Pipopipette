var Form_MODULE = (function () {
    let MODULE = {};
    // Form the players fill in before starting the game
    let formVariables = {
        nickname: document.getElementById("nickname"),
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
    };

    function extractFormInfo() {
        let extractedFormInfo = {};
        for (let [key, entry] of Object.entries(formVariables))
        {
            if (entry instanceof HTMLElement)
            {
                if (entry.tagName === "INPUT" && entry.hasAttribute("name"))
                {
                    extractedFormInfo[key] = entry.value;
                }
            }
            else
            {
                extractedFormInfo[key] = entry;
            }
        }
        return extractedFormInfo;
    }

    function loadFormLogic() {
        const failureReason = sessionStorage.getItem("join_failure");
        if (failureReason !== null)
        {
            formVariables.joinFailedMessage.innerHTML = failureReason;
            formVariables.joinFailedMessage.classList.remove("hidden");
            sessionStorage.removeItem("join_failure");
        }

        const previousFormVariablesStringified = sessionStorage.getItem("form_variables");
        if (previousFormVariablesStringified !== null)
        {
            const previousFormVariables = JSON.parse(previousFormVariablesStringified);
            formVariables.nickname.value = previousFormVariables.nickname;
        }

        let self = formVariables;
        // Show or hide game joining and creating fields (the two of them should not show at the same time)
        formVariables.radioCreate.onclick = function() {
            self.gameCreateDiv.classList.remove("hidden");
            self.gameJoinDiv.classList.add("hidden");
            self.gameopt = "create";
        };
        formVariables.radioJoin.onclick = function() {
            self.gameCreateDiv.classList.add("hidden");
            self.gameJoinDiv.classList.remove("hidden");
            self.gameopt = "join";
        };

        // When the form is submitted
        formVariables.submitButton.onclick = function(event) {
            event.preventDefault();
            if (checkIfValidInput(self))
            {
                sessionStorage.setItem("form_variables", JSON.stringify(extractFormInfo()));
                // Hide form
                self.submitDiv.classList.add("hidden");
                window.location.href = "game.html";
            }
        };
    }

    function reset() {
        formVariables.joinFailedMessage.innerHTML = "";
        formVariables.joinFailedMessage.classList.add("hidden");

        formVariables.radioCreate.checked = true;
        formVariables.radioJoin.checked = false;

        formVariables.gameCreateDiv.classList.remove("hidden");
        formVariables.gameJoinDiv.classList.add("hidden");
        formVariables.gameopt = "create";

        formVariables.xSize.value = 7;
        formVariables.ySize.value = 7;
        formVariables.playernum.value = 2;
        formVariables.gameIndex.value = null;
    }

    // Checks if entered data is valid
    function checkIfValidInput(formVariables) {
        if (formVariables.nickname.value.length > 0 && parseInt(formVariables.xSize.value) > 1 && parseInt(formVariables.ySize.value) > 1)
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
    }

    MODULE.loadFormLogic = loadFormLogic;
    MODULE.reset = reset;
    MODULE.checkIfValidInput = checkIfValidInput;

    return MODULE;
})();

window.onload = Form_MODULE.loadFormLogic;