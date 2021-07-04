Game_MODULE = (function (Game_MODULE) {
    // GameComponent can be of type "square", aka one of the squares that get colored when all the sticks around them are active
    class Square extends Game_MODULE.GameComponent {
        constructor (x, y, width, height) {
            super(x, y, width, height);

            this.owner = "white";

            // List containing all sticks that touch the square
            this.neighbouringSticks = [];
            this.collisionBox = new Game_MODULE.CollisionBox(this.x - 4, this.y - 4, this.width + 8, this.height + 8);
        }

        // How the square updates at every frame
        update (ctx, myGameArea) {
            ctx = myGameArea.context;
            ctx.fillStyle = this.owner;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        // Claims the square located next to a clicked stick
        // If all of the square"s neighbouring sticks are active, it will be colored
        claimSquare (tryingOwner) {
            if (this.owner === "white") {
                if (this.checkIfAllSurroundingSticksActive()) {
                    this.owner = tryingOwner;
                }
            }
        }

        // Checking if all of the square"s neighbours are active
        checkIfAllSurroundingSticksActive () {
            let notActive = false;
            for (let i = 0; i < this.neighbouringSticks.length; i += 1) {
                if (!this.neighbouringSticks[i].isActive()) {
                    notActive = true;
                    break;
                }
            }

            if (!notActive) {
                return true;
            } else {
                return false;
            }
        }

        // Fills neighbouringSticks with sticks colliding with square
        findNeighbours (myGameArea) {
            for (let i = 0; i < myGameArea.sticks.length; i += 1) {
                if (this.collisionBox.collidesWithBox(myGameArea.sticks[i].collisionBox)) {
                    this.neighbouringSticks.push(myGameArea.sticks[i]);
                    myGameArea.sticks[i].neighbouringSquares.push(this);
                }
            }
        }
    }
    Game_MODULE.Square = Square;

    return Game_MODULE;
})(Game_MODULE);