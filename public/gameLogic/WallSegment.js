Game_MODULE = (function (Game_MODULE) {
    // GameComponent can be of type "WallSegment", aka one of the sticks surrounding the board in the game
    class WallSegment extends Game_MODULE.GameComponent {
        constructor (x, y, width, height, orientation) {
            super(x, y, width, height);

            this.orientation = orientation;
        }

        // How the wall segment updates at every frame
        update (ctx, wallTextures) {
            // Wall segments can have 4 differemt orientations
            if (this.orientation === "top") {
                ctx.drawImage(wallTextures.top, this.x, this.y, this.width, this.height);
            } else if (this.orientation === "left") {
                ctx.drawImage(wallTextures.left, this.x, this.y, this.width, this.height);
            } else if (this.orientation === "bottom") {
                ctx.drawImage(wallTextures.bottom, this.x, this.y, this.width, this.height);
            } else if (this.orientation === "right") {
                ctx.drawImage(wallTextures.right, this.x, this.y, this.width, this.height);
            }
            // ctx.strokeStyle = "green";
            // ctx.strokeRect(this.collisionBox.x, this.collisionBox.y, this.collisionBox.width, this.collisionBox.height);
        }
    }
    Game_MODULE.WallSegment = WallSegment;

    return Game_MODULE;
})(Game_MODULE);
