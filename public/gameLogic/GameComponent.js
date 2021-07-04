Game_MODULE = (function (Game_MODULE) {
    // Every element in the game is an instance of GameComponent
    class GameComponent {
        constructor (x, y, width, height) {
            this.collisionBox = new Game_MODULE.CollisionBox(this.x, this.y, this.width, this.height);

            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }
    }
    Game_MODULE.GameComponent = GameComponent;
    
    return Game_MODULE;
})(Game_MODULE);