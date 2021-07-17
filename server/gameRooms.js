/**
 * The structure of every game as it is saved on the server
 * @typedef gameType
 * @type {Object}
 * @property {number} XSize X size of the board in number of lines
 * @property {number} YSize Y size of the board in number of lines
 * @property {Map<String, {nickname: String}>} playerdict Dictionary of players in the game
 * @property {number} expectedPlayers Number of players expected in the game
 * @property {number} playersTurnIndex Index of the player whose turn it is
 * @property {String[]} playersIdsList List of shuffled players ids to determine play order
 * @property {number[]} playersScores List of scores of the players
 */

/**
 * List of all the games
 * @type {Map<String, gameType>}
 */
const games = new Map();

/**
 * Generates a random and new game index
 * @returns {String} The new game index
 */
function generateGameIndex()
{
    let tryIndex;
    do
    {
        tryIndex = (Math.floor(Math.random() * 10)).toString();
    } while (games.has(tryIndex));
    return "0";//tryIndex;
}

/**
 * Creates a new game with the set characteristics
 * @param {number} BoardX X size of the board in number of lines 
 * @param {number} BoardY Y size of the board in number of lines
 * @param {number} playerNum Number of players expected in the game
 * @returns {String} The new game's index
 */
function createGame(BoardX, BoardY, playerNum)
{
    const gameIndex = generateGameIndex();
    const game = {
        XSize: BoardX,
        YSize: BoardY,
        playerdict: new Map(),
        expectedPlayers: playerNum,
        playersTurnIndex: 0,
        playersIdsList: [],
        playersScores: []
    };

    games.set(gameIndex, game);

    return gameIndex;
}

/**
 * Delete the game with the set index
 * @param {number} gameIndex 
 */
function deleteGame(gameIndex)
{
    console.log(`Deleting game with index ${gameIndex}`);
    games.delete(gameIndex);
}

/**
 * Get the game with the set index
 * @param {number} gameIndex 
 * @returns {gameType}
 */
function getGame(gameIndex)
{
    return games.get(gameIndex);
}

/**
 * Checks if a game with the set index exists
 * @param {String} gameIndex 
 * @returns {boolean}
 */
function gameExists(gameIndex)
{
    return games.has(gameIndex);
}

/**
 * Checks if the game is full
 * @param {String} gameIndex 
 * @returns {boolean}
 */
function gameIsFull(gameIndex) {
    const game = getGame(gameIndex);
    console.assert(game.playerdict.size <= game.expectedPlayers, "More players than possible are connected");
    return (game.playerdict.size == game.expectedPlayers);
}

/**
 * Checks if the game is empty
 * @param {String} gameIndex 
 * @returns {boolean}
 */
function gameIsEmpty(gameIndex) {
    const game = getGame(gameIndex);
    console.assert(game.playerdict.size <= game.expectedPlayers, "More players than possible are connected");
    return (game.playerdict.size == 0);
}

/**
 * Adds a new player to the game with the set index
 * @param {Object} socket 
 * @param {String} gameIndex 
 * @param {String} playerNickname
 */
function addPlayer(socket, gameIndex, playerNickname)
{
    getGame(gameIndex).playerdict.set(socket.id, {
        nickname: playerNickname
    });
    // Join the associated room
    socket.gameIndex = gameIndex;
    socket.join(socket.gameIndex);
}

/**
 * Removes a player from the game with the set index
 * @param {String} gameIndex 
 * @param {String} playerId 
 */
function removePlayer(gameIndex, playerId)
{
    if (getGame(gameIndex).playerdict.has(playerId))
        getGame(gameIndex).playerdict.delete(playerId);
}

/**
 * Sets the player's turn index to the next player's index
 * @param {String} gameIndex 
 * @returns {number} The index of the player whose turn it is after it's incremented
 */
function nextPlayersTurn(gameIndex)
{
    let game = getGame(gameIndex);
    if (++game.playersTurnIndex >= game.expectedPlayers)
        game.playersTurnIndex = 0;
    return game.playersTurnIndex;
}

/**
 * Gets the index of the player whose turn it is
 * @param {String} gameIndex 
 * @returns {number} The index of the player whose turn it is
 */
function getPlayersTurn(gameIndex) {
    return getGame(gameIndex).playersTurnIndex;
}

/**
 * Adds to the score of a player
 * @param {String} gameIndex 
 * @param {number} playerIndex The index of the player whose score has to be increased
 * @param {number} toAdd Number of points to add
 */
function addToScore(gameIndex, playerIndex, toAdd) {
    let game = getGame(gameIndex);
    game.playersScores[playerIndex] += toAdd;
}

/**
 * Returns sorted by values Object with socket.ids and scores
 * @param {String} gameIndex 
 */
function getScoreboard(gameIndex) {
    const buildMap = (keys, values) => {
        let map = new Map();
        for(let i = 0; i < keys.length; i++){
            map.set(keys[i], values[i]);
        }
        return map;
    };

    const game = getGame(gameIndex);
    let scoreboard = buildMap(game.playersIdsList, game.playersScores);
    scoreboard[Symbol.iterator] = function* () {
        yield* [...this.entries()].sort((a, b) => a[1] - b[1]);
    };

    // Sorting by score
    return [...scoreboard];
}

/**
 * Returns whether the game is finished
 * @param {String} gameIndex 
 * @returns {boolean}
 */
function gameIsFinished(gameIndex) {
    const game = getGame(gameIndex);
    return game.playersScores.reduce((a, b) => a + b, 0) == game.XSize * game.YSize;
}

/**
 * Gets and saves the players' sockets to a list inside the game object in the games map
 * @param {String} gameIndex 
 */
function initShuffledPlayersIds(gameIndex)
{
    /**
     * Shuffles an array
     * @param {any[]} array Array to shuffle
     * @returns {amy[]} Shuffled array
     */
    const shuffle = function (array) {
        var currentIndex = array.length,  randomIndex;
    
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
    
            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }
        return array;
    };

    // Initialising playersIdsList
    let game = getGame(gameIndex);
    game.playersIdsList = Array.from(game.playerdict.keys());

    for (let i = 0; i < game.playersIdsList.length; i++)
    {
        game.playersScores.push(0);
    }

    // Shuffling to determine playing order
    shuffle(game.playersIdsList);
}

module.exports = {
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
};