var Game_MODULE = (function () {
    let MODULE = {};
    // Constructor that creates collision boxes for game components
    class CollisionBox {
        constructor (x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }

        // Checks if x and y coordinates are inside the CollisionBox
        collidesWithPoint (x, y) {
            if ((x >= this.x && x <= this.x + this.width) &&
                        (y >= this.y && y <= this.y + this.height)) {
                return true;
            } else {
                return false;
            }
        }

        // Checks whether two collisionBox objects collide
        collidesWithBox (otherBox) {
            if (!(this.x >= otherBox.x + otherBox.width || this.x + this.width <= otherBox.x ||
                this.y >= otherBox.y + otherBox.height || this.y + this.height <= otherBox.y)) {
                return true;
            // // Checking if any of the other object"s corners collide with this object
            // if (this.collidesWithPoint(otherBox.x, otherBox.y) ||
            //     this.collidesWithPoint(otherBox.x + otherBox.width, otherBox.y) ||
            //     this.collidesWithPoint(otherBox.x, otherBox.y + otherBox.height) ||
            //     this.collidesWithPoint(otherBox.x + otherBox.width, otherBox.y + otherBox.height) ||
            // // Checking if any of this object"s corners collide with the other object
            //     otherBox.collidesWithPoint(this.x, this.y) ||
            //     otherBox.collidesWithPoint(this.x + this.width, this.y) ||
            //     otherBox.collidesWithPoint(this.x, this.y + this.height) ||
            //     otherBox.collidesWithPoint(this.x + this.width, this.y + this.height)) {
            //     return true;
            } else {
                return false;
            }
        }
    }
    MODULE.CollisionBox = CollisionBox;
    return MODULE;
})();
