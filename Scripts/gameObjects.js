/*global
  GameComponent,
  updateGame
*/

var
//Objects
  myGameArea,
  stickTextures,
  wallTextures,
  mouseState;

stickTextures = {
  "vertical" : {
    "IDLE" : "/Assets/StickVertical.png",
    "hover" : "/Assets/StickVertical_hover.png",
    "yellow" : "/Assets/StickVertical_yellow.png",
    "blue": "/Assets/StickVertical_blue.png"
  },
  "horizontal" : {
    "IDLE" : "./Assets/StickHorizontal.png",
    "hover" : "./Assets/StickHorizontal_hover.png",
    "yellow" : "./Assets/StickHorizontal_yellow.png",
    "blue": "./Assets/StickHorizontal_blue.png"
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
  squares : [],
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
          this.wallSegments.push(new GameComponent(65 * i, 65 * j, 74, 9, "top", "wall segment"));
        } else if (j === this.squaresHeight) {
          this.wallSegments.push(new GameComponent(65 * i, 65 * j, 74, 9, "bottom", "wall segment"));
        } else {
          this.sticks.push(new GameComponent(65 * i + 5, 65 * j, 64, 9, "horizontal", "stick"));
        }
      }
    }
    
    for (i = 0; i < this.squaresWidth + 1; i += 1) {
      for (j = 0; j < this.squaresHeight; j += 1) {
        if (i === 0) {
          this.wallSegments.push(new GameComponent(65 * i, 65 * j, 9, 74, "left", "wall segment"));
        } else if (i === this.squaresWidth) {
          this.wallSegments.push(new GameComponent(65 * i, 65 * j, 9, 74, "right", "wall segment"));
        } else {
          this.sticks.push(new GameComponent(65 * i, 65 * j + 5, 9, 64, "vertical", "stick"));
        }
      }
    }
    
    for (i = 0; i < this.squaresWidth; i += 1) {
      for (j = 0; j < this.squaresHeight; j += 1) {
        this.squares.push(new GameComponent(65 * i + 10, 65 * j + 10, 54, 54, "white", "square"));
      }
    }
    
    for (i = 0; i < this.sticks.length; i += 1) {
      this.sticks[i].findNeighbours();
    }
    
    for (i = 0; i < this.squares.length; i += 1) {
      this.squares[i].findNeighbours();
    }
    
    this.interval = setInterval(updateGame, 20);
	},
  clear : function () {
    "use strict";
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
};

mouseState = {
  x : 0,
  y : 0,
  mouseReleaseLocation : {
    x : -1,
    y : -1
  },
  changeMousePos : function (event) {
    "use strict";
    var rect = myGameArea.canvas.getBoundingClientRect();
    mouseState.x = event.clientX - rect.left;
    mouseState.y = event.clientY - rect.top;
  },
  mouseReleased : function (event) {
    "use strict";
    var rect = myGameArea.canvas.getBoundingClientRect();
    mouseState.mouseReleaseLocation.x = event.clientX - rect.left;
    mouseState.mouseReleaseLocation.y = event.clientY - rect.top;
  }
};