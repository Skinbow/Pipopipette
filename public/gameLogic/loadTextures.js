Game_MODULE = (function (Game_MODULE) {
    let stickTextures,
        wallTextures;

    Game_MODULE.stickTexturesInitiated = false;
    Game_MODULE.wallTexturesInitiated = false;

    // Textures imported from Assets folder for the "stick" type GameComponents
    stickTextures = {
        types: ["IDLE", "hover", "yellow", "blue", "red", "green"],
        horizontal: [],
        vertical: [],

        // Method used to extract images from paths
        init: function () {
            if (Game_MODULE.stickTexturesInitiated)
                return;

            let tempImg;
            // Creating images with given source paths
            for (let type of this.types) {
                tempImg = new Image();
                tempImg.src = "./public/assets/StickTextures/" + type + "/StickHorizontal.png";
                this["horizontal"][type] = tempImg;

                tempImg = new Image();
                tempImg.src = "./public/assets/StickTextures/" + type + "/StickVertical.png";
                this["vertical"][type] = tempImg;
            }
            Game_MODULE.stickTexturesInitiated = true;
        }
    };

    // Textures imported from Assets folder for the "wall segment" type GameComponents
    wallTextures = {
        top: "./public/assets/WallTextures/WallTop.png",
        left: "./public/assets/WallTextures/WallLeft.png",
        bottom: "./public/assets/WallTextures/WallBottom.png",
        right: "./public/assets/WallTextures/WallRight.png",

        // Method used to extract images from paths
        init: function () {
            if (Game_MODULE.wallTexturesInitiated)
                return;

            let key,
                tempImg;

            // Creating images with given source paths
            for (key in wallTextures) {
                if (key !== "init" && Object.prototype.hasOwnProperty.call(wallTextures, key)) {
                    tempImg = new Image();

                    tempImg.src = wallTextures[key];
                    wallTextures[key] = tempImg;
                }
            }
            Game_MODULE.wallTexturesInitiated = true;
        }
    };
    Game_MODULE.stickTextures = stickTextures;
    Game_MODULE.wallTextures = wallTextures;

    return Game_MODULE;
})(Game_MODULE);