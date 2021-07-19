var Form_MODULE = (function () {
    let MODULE = {};
    // Form the players fill in before starting the game
    let formVariables = {
        nickname: document.getElementById("nickname"),
        buttonCreate: document.getElementById("gameCreateButton"),
        buttonJoin: document.getElementById("gameJoinButton"),
        gameopt: "create",

        gameCreateDiv: document.getElementById("gameCreateDiv"),
        xSize: document.getElementById("xSize"),
        ySize: document.getElementById("ySize"),
        playernum: document.getElementById("playerNum"),

        gameJoinDiv: document.getElementById("gameJoinDiv"),
        gameIndex: document.getElementById("gameIndex"),

        nicknameFormDiv: document.getElementById("nicknameFormDiv"),
        gameFormDiv: document.getElementById("gameSelectionDiv"),
        submitButton: document.getElementById("submitButton"),
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

    function gotoGameSelect() {
        formVariables.nicknameFormDiv.classList.add("hidden");
        formVariables.gameFormDiv.classList.remove("hidden");
    }

    function selectJoin(formVariables) {
        formVariables.buttonCreate.classList.remove("hidden");
        formVariables.gameJoinDiv.classList.remove("hidden");

        formVariables.buttonJoin.classList.add("hidden");
        formVariables.gameCreateDiv.classList.add("hidden");

        formVariables.gameopt = "join";
    }

    function selectCreate(formVariables) {
        formVariables.buttonJoin.classList.remove("hidden");
        formVariables.gameCreateDiv.classList.remove("hidden");

        formVariables.buttonCreate.classList.add("hidden");
        formVariables.gameJoinDiv.classList.add("hidden");

        formVariables.gameopt = "create";
    }

    function loadFormLogic() {
        const previousFormVariablesStringified = sessionStorage.getItem("form_variables");
        if (previousFormVariablesStringified !== null)
        {
            const previousFormVariables = JSON.parse(previousFormVariablesStringified);
            formVariables.nickname.value = previousFormVariables.nickname;
            setTimeout(function () {
                const failureReason = sessionStorage.getItem("join_failure");
                if (failureReason !== null)
                {
                    gotoGameSelect();
                    selectJoin(formVariables);
                    alert(failureReason);
                    sessionStorage.removeItem("join_failure");
                }
            }, 100);
        }
        
        // Show or hide game joining and creating fields (the two of them should not show at the same time)
        formVariables.buttonCreate.onclick = function() {
            selectCreate(formVariables);
        };
        formVariables.buttonJoin.onclick = function() {
            selectJoin(formVariables);
        };

        // When the form is submitted
        formVariables.submitButton.onclick = function(event) {
            event.preventDefault();
            if (checkIfValidInput(formVariables))
            {
                sessionStorage.setItem("form_variables", JSON.stringify(extractFormInfo()));
                // Hide form
                formVariables.gameFormDiv.classList.add("hidden");
                window.location.href = "game.html";
            }
        };
    }

    // function reset() {
    //     formVariables.buttonJoin.classList.remove("hidden") = true;
    //     formVariables.radioJoin.checked = false;

    //     formVariables.gameCreateDiv.classList.remove("hidden");
    //     formVariables.gameJoinDiv.classList.add("hidden");
    //     formVariables.gameopt = "create";

    //     formVariables.xSize.value = 7;
    //     formVariables.ySize.value = 7;
    //     formVariables.playernum.value = 2;
    //     formVariables.gameIndex.value = null;
    // }

    // Only to check if nickname was correctly entered
    function checkIfValidName(formVariables) {
        if (formVariables.nickname.value.length > 0)
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    // Checks if entered data is valid (nickname is checked again here to make sure the html wasn't modified and the server will receive a valid nickname)
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

    function nameEntered(e) {
        if (e.code === "Enter")
        {
            e.preventDefault();
            if (checkIfValidName(formVariables))
            {
                formVariables.nicknameFormDiv.classList.add("hidden");
                formVariables.gameFormDiv.classList.remove("hidden");
            }
        }
    }

    MODULE.nameEntered = nameEntered;
    MODULE.loadFormLogic = loadFormLogic;
    //MODULE.reset = reset;
    MODULE.checkIfValidInput = checkIfValidInput;

    //Debug
    MODULE.gotoGameSelect = gotoGameSelect;

    return MODULE;
})();

window.onload = () => {
    Form_MODULE.loadFormLogic();
    //Debug
    //Form_MODULE.gotoGameSelect();
}; 
document.onkeypress = Form_MODULE.nameEntered;