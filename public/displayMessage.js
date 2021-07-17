var DisplayedMessage_MODULE = (function () {
    let MODULE = {};

    let displayedMessage = {
        messageDiv: document.createElement("div"),
        message: document.createElement("h1"),
        gameIndex: document.createElement("h3")
    };

    let initialized = false,
        shown = false;

    function init() {
        displayedMessage.messageDiv.appendChild(displayedMessage.message);
        displayedMessage.messageDiv.appendChild(displayedMessage.gameIndex);

        displayedMessage.messageDiv.id = "displayedMessage";

        displayedMessage.message.style.textAlign = "center";
        displayedMessage.gameIndex.style.textAlign = "center";

        initialized = true;
    }

    function show() {
        if (!initialized) {
            init();
        }
        if (!shown)
        {
            document.body.appendChild(displayedMessage.messageDiv);
            shown = true;
        }
    }

    function hide() {
        if (shown)
        {
            document.body.removeChild(displayedMessage.messageDiv);
            shown = false;
        }
    }

    function displayWaitingMessage(message, gameIndexMessage) {
        displayedMessage.message.innerHTML = message;
        displayedMessage.gameIndex.innerHTML = gameIndexMessage;
        if (typeof gameIndexMessage !== "string")
            displayedMessage.gameIndex.classList.add("hidden");
        else
            displayedMessage.gameIndex.classList.remove("hidden");

        show();
    }
    
    MODULE.displayWaitingMessage = displayWaitingMessage;
    MODULE.show = show;
    MODULE.hide = hide;

    return MODULE;
})();