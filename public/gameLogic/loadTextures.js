Game_MODULE = (function (Game_MODULE) {
    let stickTextures,
        wallTextures;

    Game_MODULE.stickTexturesInitiated = false;
    Game_MODULE.wallTexturesInitiated = false;

    // Textures imported from Assets folder for the "stick" type GameComponents
    stickTextures = {
        vertical:
        {
            IDLE: "./public/assets/StickVertical.png",
            hover: "./public/assets/StickVertical_hover.png",
            yellow: "./public/assets/StickVertical_yellow.png",
            blue: "./public/assets/StickVertical_blue.png"
        },
        horizontal:
        {
            IDLE: "./public/assets/StickHorizontal.png",
            hover: "./public/assets/StickHorizontal_hover.png",
            yellow: "./public/assets/StickHorizontal_yellow.png",
            blue: "./public/assets/StickHorizontal_blue.png"
        },

        // Method used to extract images from paths
        init: function () {
            if (Game_MODULE.stickTexturesInitiated)
                return;

            let orientation,
                key,
                tempImg;

            // Creating images with given source paths
            for (orientation in stickTextures) {
                if (orientation !== "init" && Object.prototype.hasOwnProperty.call(stickTextures, orientation)) {
                    for (key in stickTextures[orientation]) {
                        if (Object.prototype.hasOwnProperty.call(stickTextures[orientation], key))
                        {
                            tempImg = new Image();
                            tempImg.src = stickTextures[orientation][key];
                            stickTextures[orientation][key] = tempImg;
                        }
                        
                    }
                }
            }
            Game_MODULE.stickTexturesInitiated = true;
        }
    };

    // Textures imported from Assets folder for the "wall segment" type GameComponents
    wallTextures = {
        top: "./public/assets/WallTop.png",
        left: "./public/assets/WallLeft.png",
        bottom: "./public/assets/WallBottom.png",
        right: "./public/assets/WallRight.png",

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