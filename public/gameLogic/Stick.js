Game_MODULE = (function (Game_MODULE) {
    // GameComponent can be of type "Stick", aka one of the sticks in the game
    class Stick extends Game_MODULE.GameComponent {
        constructor (x, y, width, height, orientation, numberOfSticksCreated) {
            super(x, y, width, height);

            this.orientation = orientation;

            this.owner = "";
            this.hover = false;

            // List of GameComponent of type "Square" that collide with this stick
            this.neighbouringSquares = [];

            // Every stick has an assigned id, the id corresponds to the number of sticks previously created
            this.id = numberOfSticksCreated; // myGameArea.sticks.length;

            this.makeCollisionBox();
        }

        isActive () {
            if (this.owner.length !== 0) {
                return true;
            } else {
                return false;
            }
        }

        // How the stick updates at every frame
        update (mouseState, stickTextures, myGameArea, myTurn) {
            let MouseCollides = this.collisionBox.collidesWithPoint(mouseState.x, mouseState.y);

            // Made to avoid several sticks being activated at once
            this.checkIfHoveringOverOne(MouseCollides, myGameArea);

            // Active if mouse was hovering over this stick only and the left mouse button was released
            if (this.collisionBox.collidesWithPoint(mouseState.mouseReleaseLocation.x, mouseState.mouseReleaseLocation.y) && mouseState.mouseReleaseLocation.recently && this.hover && myTurn) {
                mouseState.mouseReleaseLocation.recently = false;
                this.claimStick(myGameArea.playersTurn);
                for (let i = 0; i < this.neighbouringSquares.length; i += 1) {
                    // Trying to claim surrounding squares which get claimed if all the sticks surrounding them are active
                    console.log("The color of the player who is claiming is: " + myGameArea.playersTurn.color);
                    this.neighbouringSquares[i].claimSquare(myGameArea.playersTurn.color);
                }
            }
            this.display(myGameArea.context, stickTextures);
        }

        // Displaying the stick
        display (ctx, stickTextures) {
            if (this.orientation === "horizontal") {
                if (this.isActive()) {
                    ctx.drawImage(stickTextures.horizontal[this.owner], this.x, this.y, this.width, this.height);
                } else if (!this.hover) {
                    ctx.drawImage(stickTextures.horizontal.IDLE, this.x, this.y, this.width, this.height);
                } else {
                    ctx.drawImage(stickTextures.horizontal.hover, this.x, this.y, this.width, this.height);
                }
            } else if (this.orientation === "vertical") {
                if (this.isActive()) {
                    ctx.drawImage(stickTextures.vertical[this.owner], this.x, this.y, this.width, this.height);
                } else if (!this.hover) {
                    ctx.drawImage(stickTextures.vertical.IDLE, this.x, this.y, this.width, this.height);
                } else {
                    ctx.drawImage(stickTextures.vertical.hover, this.x, this.y, this.width, this.height);
                }
            }
        }

        // Assigning a collisionBox to the stick which depends on the stick"s orientation
        makeCollisionBox () {
            if (this.orientation === "horizontal") {
                this.collisionBox = new Game_MODULE.CollisionBox(this.x - 1, this.y, this.width + 2, this.height);
            } else if (this.orientation === "vertical") {
                this.collisionBox = new Game_MODULE.CollisionBox(this.x, this.y - 1, this.width, this.height + 2);
            }
        }

        // Fills this.neighbours with neighbouring sticks and wall segments
        findNeighbours (myGameArea) {
            this.neighbouringSticks = [];
            this.neighbouringWallSegments = [];
            for (let i = 0; i < myGameArea.sticks.length; i += 1) {
                if (this.collisionBox.collidesWithBox(myGameArea.sticks[i].collisionBox)) {
                    this.neighbouringSticks.push(myGameArea.sticks[i]);
                }
            }
            for (let i = 0; i < myGameArea.wallSegments.length; i += 1) {
                if (this.collisionBox.collidesWithBox(myGameArea.wallSegments[i].collisionBox)) {
                    this.neighbouringWallSegments.push(myGameArea.wallSegments[i]);
                }
            }
        }

        // Attempt to claim stick
        claimStick (tryingOwner) {
            // If stick already belongs to someone
            if (!this.isActive()) {
                // If stick touches an active stick or a wall segment
                if (this.checkIfNeighboursAllowColoration()) {
                    this.owner = tryingOwner.color;
                    console.log("stick claimed by " + tryingOwner.nickname);
                    socket.emit("claimedStick", tryingOwner, this.id);
                }
            }
        }

        // Checks if stick touches an active stick or a wall segment
        checkIfNeighboursAllowColoration () {
            if (this.neighbouringWallSegments.length > 0)
                return true;

            for (let i = 0; i < this.neighbouringSticks.length; i += 1) {
                if (this.neighbouringSticks[i].isActive()) {
                    return true;
                }
            }
            return false;
        }

        // Checks if mouse is hovering over only one stick
        checkIfHoveringOverOne (MouseCollides, myGameArea) {
            let foundHover;
            if (MouseCollides) {
                foundHover = false;
                for (let i = 0; i < myGameArea.sticks.length; i += 1) {
                    if (myGameArea.sticks[i].hover) {
                        foundHover = true;
                        break;
                    }
                }
                if (!foundHover) {
                    this.hover = true;
                }
            } else {
                this.hover = false;
            }
        }
    }
    Game_MODULE.Stick = Stick;

    return Game_MODULE;
})(Game_MODULE);