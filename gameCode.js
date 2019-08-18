var
//Objects
  myGameArea,
  stickTextures,
  wallTextures,
//Constructors
  GameComponent,
//Functions
  mouseLocation,
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
    for (orientation in this) {
      if (this.hasOwnProperty(orientation)) {
        for (key in this[orientation]) {
          if (this[orientation].hasOwnProperty(key)) {
            tempImg = new Image();
            tempImg.src = this[orientation][key];
            this[orientation][key] = tempImg;
          }
        }
      }
    }
  }
};

wallTextures = {
  "top" : "",
  "left" : "",
  "bottom" : "/Assets/WallBottom.png",
  "right" : "",
  init : function () {
    "use strict";
    var key,
      tempImg;
    for (key in this) {
      if (this.hasOwnProperty(key)) {
        tempImg = new Image();
        tempImg.src = this[key];
        this[key] = tempImg;
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
        if (j === this.squaresHeight) {
          this.wallSegments.push(new GameComponent(65 * i + 5, 65 * j, 74, 13, "bottom", "wall segment"));
        } else {
          this.sticks.push(new GameComponent(65 * i + 5, 65 * j, 64, 9, "horizontal", "stick"));
        }
      }
    }
    
    for (i = 0; i < this.squaresWidth + 1; i += 1) {
      for (j = 0; j < this.squaresHeight; j += 1) {
        this.sticks.push(new GameComponent(65 * i, 65 * j + 5, 9, 64, "vertical", "stick"));
      }
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
  
  if (type === "stick") {
    this.orientation = style;
    this.update = function (MouseCollides) {
      ctx = myGameArea.context;
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
};

mouseLocation = {
  x : 0,
  y : 0,
  changeMousePos : function (event) {
    "use strict";
    var rect = myGameArea.canvas.getBoundingClientRect();
    mouseLocation.x = event.clientX - rect.left;
    mouseLocation.y = event.clientY - rect.top;
  }
};

startGame = function () {
	"use strict";
  stickTextures.init();
  wallTextures.init();
  myGameArea.start();
  myGameArea.canvas.addEventListener("mousemove", mouseLocation.changeMousePos);
};

updateGame = function () {
  "use strict";
  var i;
  
  myGameArea.clear();
  for (i = 0; i < myGameArea.sticks.length; i += 1) {
    myGameArea.sticks[i].update(myGameArea.sticks[i].collidesWithPoint(mouseLocation.x, mouseLocation.y));
  }
};

window.onload = startGame;