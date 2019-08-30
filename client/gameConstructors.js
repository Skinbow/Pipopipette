/*global
  myGameArea,
  mouseState,
  stickTextures,
  wallTextures
*/

var
//Constructors
  GameComponent,
  CollisionBox;

//Every element in the game is an instance of GameComponent
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
    this.owner = "";
    this.orientation = style;
    this.hover = false;
    this.neighbouringSquares = [];
    
    if (this.orientation === "horizontal") {
      this.collisionBox = new CollisionBox(this.x - 1, this.y, this.width + 2, this.height);
    } else if (this.orientation === "vertical") {
      this.collisionBox = new CollisionBox(this.x, this.y - 1, this.width, this.height + 2);
    }
    
    this.update = function (MouseCollides) {
      var i;
      
      //Introduced to avoid several sticks being activated at once
      this.checkIfHoveringOverOne(MouseCollides);
      
      ctx = myGameArea.context;
      if (this.collisionBox.collidesWithPoint(mouseState.mouseReleaseLocation.x, mouseState.mouseReleaseLocation.y) && this.hover) {
        this.claimStick("yellow");
        for (i = 0; i < this.neighbouringSquares.length; i += 1) {
          this.neighbouringSquares[i].claimSquare("yellow");
        }
      }
      
      if (this.orientation === "horizontal") {
        if (this.active) {
          ctx.drawImage(stickTextures.horizontal[this.owner], this.x, this.y, this.width, this.height);
        } else if (!this.hover) {
          ctx.drawImage(stickTextures.horizontal.IDLE, this.x, this.y, this.width, this.height);
        } else {
          ctx.drawImage(stickTextures.horizontal.hover, this.x, this.y, this.width, this.height);
        }
      } else if (this.orientation === "vertical") {
        if (this.active) {
          ctx.drawImage(stickTextures.vertical[this.owner], this.x, this.y, this.width, this.height);
        } else if (!this.hover) {
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
        if (this.collisionBox.collidesWithBox(myGameArea.sticks[i].collisionBox)) {
          this.neighbours.push(myGameArea.sticks[i]);
        }
      }
      for (i = 0; i < myGameArea.wallSegments.length; i += 1) {
        if (this.collisionBox.collidesWithBox(myGameArea.wallSegments[i].collisionBox)) {
          this.neighbours.push(myGameArea.wallSegments[i]);
        }
      }
    };
    
    this.claimStick = function (tryingOwner) {
      if (!this.active) {
        if (this.checkIfNeighboursAllowColoration()) {
          this.active = true;
          this.owner = tryingOwner;
        }
      }
    };
    
    this.checkIfNeighboursAllowColoration = function () {
      var i;
      for (i = 0; i < this.neighbours.length; i += 1) {
        if (this.neighbours[i].type === "wall segment" || this.neighbours[i].active) {
          return true;
        }
      }
      return false;
    };
    
    this.checkIfHoveringOverOne = function (MouseCollides) {
      var i,
        foundHover;
      if (MouseCollides) {
        foundHover = false;
        for (i = 0; i < myGameArea.sticks.length; i += 1) {
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
    };
    
  } else if (type === "wall segment") {
    this.collisionBox = new CollisionBox(this.x, this.y, this.width, this.height);
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
  } else if (type === "square") {
    this.owner = style;
    this.neighbouringSticks = [];
    this.collisionBox = new CollisionBox(this.x - 4, this.y - 4, this.width + 8, this.height + 8);
    this.update = function () {
      ctx = myGameArea.context;
      ctx.fillStyle = this.owner;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    };
    
    this.claimSquare = function (tryingOwner) {
      if (this.owner === "white") {
        if (this.checkIfAllSurroundingSticksActive()) {
          this.owner = tryingOwner;
        }
      }
    };
    
    //Checking if all of the square's neighbours are active
    this.checkIfAllSurroundingSticksActive = function () {
      var i,
        notActive = false;
      for (i = 0; i < this.neighbouringSticks.length; i += 1) {
        if (!this.neighbouringSticks[i].active) {
          notActive = true;
          break;
        }
      }
      
      if (!notActive) {
        return true;
      } else {
        return false;
      }
    };
    this.findNeighbours = function () {
      var i;
      for (i = 0; i < myGameArea.sticks.length; i += 1) {
        if (this.collisionBox.collidesWithBox(myGameArea.sticks[i].collisionBox)) {
          this.neighbouringSticks.push(myGameArea.sticks[i]);
          myGameArea.sticks[i].neighbouringSquares.push(this);
        }
      }
    };
  }
};


CollisionBox = function (x, y, width, height) {
  "use strict";
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  
  this.collidesWithPoint = function (x, y) {
    if ((x >= this.x && x <= this.x + this.width) && (y >= this.y && y <= this.y + this.height)) {
      return true;
    } else {
      return false;
    }
  };
  
  this.collidesWithBox = function (otherBox) {
    //Checking if any of the other object's corners collide with this object
    if (this.collidesWithPoint(otherBox.x, otherBox.y) ||
        this.collidesWithPoint(otherBox.x + otherBox.width, otherBox.y) ||
        this.collidesWithPoint(otherBox.x, otherBox.y + otherBox.height) ||
        this.collidesWithPoint(otherBox.x + otherBox.width, otherBox.y + otherBox.height) ||
    //Checking if any of this object's corners collide with the other object
        otherBox.collidesWithPoint(this.x, this.y) ||
        otherBox.collidesWithPoint(this.x + this.width, this.y) ||
        otherBox.collidesWithPoint(this.x, this.y + this.height) ||
        otherBox.collidesWithPoint(this.x + this.width, this.y + this.height)) {
      return true;
    } else {
      return false;
    }
  };
};