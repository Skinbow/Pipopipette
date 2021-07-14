var Form_MODULE = (function () {
    let MODULE = {};
    // Form the players fill in before starting the game
    let FormVariables = function () {
        // Private methods
        let checkIfValidInput;

        this.nickname = document.getElementById("nickname"),
        this.radioCreate = document.getElementById("create"),
        this.radioJoin = document.getElementById("join"),
        this.gameopt = "create",

        this.gameCreateDiv = document.getElementById("gameCreateDiv"),
        this.xSize = document.getElementById("xSize"),
        this.ySize = document.getElementById("ySize"),
        this.playernum = document.getElementById("playerNum"),

        this.gameJoinDiv = document.getElementById("gameJoinDiv"),
        this.gameIndex = document.getElementById("gameIndex"),

        this.submitDiv = document.getElementById("submitDiv"),
        this.submitButton = document.getElementById("submitButton"),

        this.joinFailedMessage = document.getElementById("joinFailedMessage"),

        this.loadFormLogic = function(startConnection) {
            let self = this;
            // Show or hide game joining and creating fields (the two of them should not show at the same time)
            this.radioCreate.onclick = function() {
                self.gameCreateDiv.classList.remove("hidden");
                self.gameJoinDiv.classList.add("hidden");
                self.gameopt = "create";
            };
            this.radioJoin.onclick = function() {
                self.gameCreateDiv.classList.add("hidden");
                self.gameJoinDiv.classList.remove("hidden");
                self.gameopt = "join";
            };

            // When the form is submitted
            this.submitButton.onclick = function(event) {
                event.preventDefault();
                if (checkIfValidInput(self))
                {
                    // Hide form
                    self.submitDiv.classList.add("hidden");
                    startConnection();
                }
            };
        };

        this.reset = function() {
            this.joinFailedMessage.innerHTML = "";
            this.joinFailedMessage.classList.add("hidden");

            this.radioCreate.checked = true;
            this.radioJoin.checked = false;

            this.gameCreateDiv.classList.remove("hidden");
            this.gameJoinDiv.classList.add("hidden");
            this.gameopt = "create";

            this.xSize.value = 7;
            this.ySize.value = 7;
            this.playernum.value = 2;
            this.gameIndex.value = null;
        };

        // Checks if entered data is valid
        checkIfValidInput = function(formVariables) {
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
        };
    };
    MODULE.formVariables = new FormVariables;

    return MODULE;
})();