/*global
  GameComponent,
  updateGame
*/

var
//Objects
  myGameArea,
  stickTextures,
  wallTextures;

stickTextures = {
  "vertical" : {
    "IDLE" : "Assets/StickVertical.png",
    "hover" : "Assets/StickVertical_hover.png",
    "yellow" : "Assets/StickVertical_yellow.png"
  },
  "horizontal" : {
    "IDLE" : "Assets/StickHorizontal.png",
    "hover" : "Assets/StickHorizontal_hover.png",
    "yellow" : "Assets/StickHorizontal_yellow.png"
  },
  init : function () {
    "use strict";
    var orientation,
      key,
      tempImg;
    
    for (orientation in stickTextures) {
      if (stickTextures.hasOwnProperty(orientation)) {
        for (key in stickTextures[orientation]) {
          if (stickTextures[orientation].hasOwnProperty(key)) {
            tempImg = new Image();
            tempImg.src = stickTextures[orientation][key];
            stickTextures[orientation][key] = tempImg;
          }
        }
      }
    }
  }
};

wallTextures = {
  "top" : "Assets/WallTop.png",
  "left" : "Assets/WallLeft.png",
  "bottom" : "Assets/WallBottom.png",
  "right" : "Assets/WallRight.png",
  init : function () {
    "use strict";
    var key,
      tempImg;
    
    for (key in wallTextures) {
      if (wallTextures.hasOwnProperty(key)) {
        tempImg = new Image();
        tempImg.src = wallTextures[key];
        wallTextures[key] = tempImg;
      }
    }
  }
};

myGameArea = {
	canvas : document.createElement("canvas"),
  sticks : [],
  wallSegments : [],
	start : function () {
    "use strict";
    
    var i, j;
		this.canvas.width = 800;
		this.canvas.height = 600;
    this.squaresHeight = 5;
    this.squaresWidth = 7;
		this.context = this.canvas.getContext("2d");
    
		document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    
    for (i = 0; i < this.squaresWidth; i += 1) {
      for (j = 0; j < this.squaresHeight + 1; j += 1) {
        if (j === 0) {
          this.wallSegments.push(new GameComponent(65 * i, 65 * j, 74, 13, "top", "wall segment"));
        } else if (j === this.squaresHeight) {
          this.wallSegments.push(new GameComponent(65 * i, 65 * j - 4, 74, 13, "bottom", "wall segment"));
        } else {
          this.sticks.push(new GameComponent(65 * i + 5, 65 * j, 64, 9, "horizontal", "stick"));
        }
      }
    }
    
    for (i = 0; i < this.squaresWidth + 1; i += 1) {
      for (j = 0; j < this.squaresHeight; j += 1) {
        if (i === 0) {
          this.wallSegments.push(new GameComponent(65 * i, 65 * j, 13, 74, "left", "wall segment"));
        } else if (i === this.squaresWidth) {
          this.wallSegments.push(new GameComponent(65 * i - 4, 65 * j, 13, 74, "right", "wall segment"));
        } else {
          this.sticks.push(new GameComponent(65 * i, 65 * j + 5, 9, 64, "vertical", "stick"));
        }
      }
    }
    
    for (i = 0; i < this.sticks.length; i += 1) {
      this.sticks[i].findNeighbours();
    }
    
    this.interval = setInterval(updateGame, 20);
	},
  clear : function () {
    "use strict";
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
};