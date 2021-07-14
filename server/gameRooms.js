/**
 * Dictionary of players in a game
 * @typedef playerdictType
 * @type {Map<String, {nickname: String}>}
 */

/**
 * The structure of every game as it is saved on the server
 * @typedef gameType
 * @type {Object}
 * @property {number} XSize X size of the board in number of lines
 * @property {number} YSize Y size of the board in number of lines
 * @property {playerdictType} playerdict Dictionary of players in the game
 * @property {number} expectedPlayers Number of players expected in the game
 * @property {number} playersTurnIndex Index of the player whose turn it is
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
    return tryIndex;
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
        playersTurnIndex: 0
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
 * Adds a new player to the game with the set index
 * @param {Object} socket 
 * @param {String} gameIndex 
 * @param {{id: String, nickname: String}} playerInfo 
 */
function addPlayer(socket, gameIndex, playerInfo)
{
    getGame(gameIndex).playerdict.set(playerInfo.id, {
        nickname: playerInfo.nickname
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
 * @returns {number} The index of the player whose turn it is
 */
function nextPlayersTurn(gameIndex)
{
    let game = getGame(gameIndex);
    if (++game.playersTurnIndex >= game.expectedPlayers)
        game.playersTurnIndex = 0;
    return game.playersTurnIndex;
}

/**
 * Gets and saves the players' sockets to a list inside the game object in the games map
 * @param {String} gameIndex 
 */
function getPlayersSockets(gameIndex)
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

    // Shuffling to determine playing order
    // shuffle(game.playerSockets);
}

module.exports = {
    createGame,
    deleteGame,
    getGame,
    gameExists,
    addPlayer,
    removePlayer,
    nextPlayersTurn
};