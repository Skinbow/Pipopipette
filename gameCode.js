var
//Objects
  myGameArea,
  stickTextures,
  wallTextures,
//Constructors
  GameComponent,
//Functions
  mouseState,
  startGame,
  updateGame;

stickTextures = {
  "vertical" : {
    "IDLE" : "Assets/StickVertical.png",
    "hover" : "Assets/StickVertical_hover.png"
  },
  "horizontal" : {
    "IDLE" : "Assets/StickHorizontal.png",
    "hover" : "Assets/StickHorizontal_hover.png"
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

GameComponent = function (x, y, width, height, style, type) {
  "use strict";
  var ctx;
  
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
  
  this.type = type;
  
  if (type === "stick") {
    this.active = false;
    this.orientation = style;
    this.update = function (MouseCollides) {
      ctx = myGameArea.context;
      if (MouseCollides && mouseState.mouseClicksSinceLastChecked > 0) {
        
        mouseState.mouseClicksSinceLastChecked = 0;
      }
      if (this.orientation === "horizontal") {
        if (!MouseCollides) {
          ctx.drawImage(stickTextures.horizontal.IDLE, this.x, this.y, this.width, this.height);
        } else {
          ctx.drawImage(stickTextures.horizontal.hover, this.x, this.y, this.width, this.height);
        }
      } else if (this.orientation === "vertical") {
        if (!MouseCollides) {
          ctx.drawImage(stickTextures.vertical.IDLE, this.x, this.y, this.width, this.height);
        } else {
          ctx.drawImage(stickTextures.vertical.hover, this.x, this.y, this.width, this.height);
        }
      }
    };
    
    this.findNeighbours = function () {
      this.neighbours = [];
      var i;
      for (i = 0; i < myGameArea.sticks.length; i += 1) {
        if (this.collidesWithGameComponent(myGameArea.sticks[i])) {
          this.neighbours.push(myGameArea.sticks[i]);
        }
      }
      for (i = 0; i < myGameArea.wallSegments.length; i += 1) {
        if (this.collidesWithGameComponent(myGameArea.wallSegments[i])) {
          this.neighbours.push(myGameArea.wallSegments[i]);
        }
      }
    };
    
  } else if (type === "wall segment") {
    this.orientation = style;
    this.update = function () {
      ctx = myGameArea.context;
      if (this.orientation === "top") {
        ctx.drawImage(wallTextures.top, this.x, this.y, this.width, this.height);
      } else if (this.orientation === "left") {
        ctx.drawImage(wallTextures.left, this.x, this.y, this.width, this.height);
      } else if (this.orientation === "bottom") {
        ctx.drawImage(wallTextures.bottom, this.x, this.y, this.width, this.height);
      } else if (this.orientation === "right") {
        ctx.drawImage(wallTextures.right, this.x, this.y, this.width, this.height);
      }
    };
  } else {
    this.color = style;
    this.update = function () {
      ctx = myGameArea.context;
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    };
  }
  
  this.collidesWithPoint = function (x, y) {
    if ((x > this.x && x < this.x + this.width) && (y > this.y && y < this.y + this.height)) {
      return true;
    } else {
      return false;
    }
  };
  
  this.collidesWithGameComponent = function (otherComponent) {
    //Checking if any of the other object's corners collide with this object
    if (this.collidesWithPoint(otherComponent.x, otherComponent.y) ||
        this.collidesWithPoint(otherComponent.x + otherComponent.width, otherComponent.y) ||
        this.collidesWithPoint(otherComponent.x, otherComponent.y + otherComponent.height) ||
        this.collidesWithPoint(otherComponent.x + otherComponent.width, otherComponent.y + otherComponent.height) ||
    //Checking if any of this object's corners collide with the other object
        otherComponent.collidesWithPoint(this.x, this.y) ||
        otherComponent.collidesWithPoint(this.x + this.width, this.y) ||
        otherComponent.collidesWithPoint(this.x, this.y + this.height) ||
        otherComponent.collidesWithPoint(this.x + this.width, this.y + this.height)) {
      return true;
    } else {
      return false;
    }
  };
};

mouseState = {
  x : 0,
  y : 0,
  mousePressed : false,
  mouseClicksSinceLastCheck : 0,
  changeMousePos : function (event) {
    "use strict";
    var rect = myGameArea.canvas.getBoundingClientRect();
    mouseState.x = event.clientX - rect.left;
    mouseState.y = event.clientY - rect.top;
  },
  changeButtonState : function (event) {
    "use strict";
    if (event.type === "mousedown") {
      mouseState.mousePressed = true;
    } else if (event.type === "mouseup") {
      mouseState.mousePressed = false;
      mouseState.mouseClicksSinceLastCheck += 1;
    }
  }
};

startGame = function () {
	"use strict";
  wallTextures.init();
  stickTextures.init();
  myGameArea.start();
  myGameArea.canvas.addEventListener("mousemove", mouseState.changeMousePos);
  myGameArea.canvas.addEventListener("mousedown", mouseState.changeButtonState);
  myGameArea.canvas.addEventListener("mouseup", mouseState.changeButtonState);
};

updateGame = function () {
  "use strict";
  var i;
  
  myGameArea.clear();
  for (i = 0; i < myGameArea.sticks.length; i += 1) {
    myGameArea.sticks[i].update(myGameArea.sticks[i].collidesWithPoint(mouseState.x, mouseState.y));
  }
  for (i = 0; i < myGameArea.wallSegments.length; i += 1) {
    myGameArea.wallSegments[i].update();
  }
};

window.onload = startGame;