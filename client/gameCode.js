/*global
  myGameArea,
  wallTextures,
  stickTextures,
  mouseState
*/

var
//Functions
  startGame,
  updateGame;

startGame = function () {
	"use strict";
  wallTextures.init();
  stickTextures.init();
  myGameArea.start();
  myGameArea.canvas.addEventListener("mousemove", mouseState.changeMousePos);
  myGameArea.canvas.addEventListener("mouseup", mouseState.mouseReleased);
};

updateGame = function () {
  "use strict";
  var i;
  
  myGameArea.clear();
  for (i = 0; i < myGameArea.sticks.length; i += 1) {
    myGameArea.sticks[i].update(myGameArea.sticks[i].collisionBox.collidesWithPoint(mouseState.x, mouseState.y));
  }
  for (i = 0; i < myGameArea.wallSegments.length; i += 1) {
    myGameArea.wallSegments[i].update();
  }
};

window.onload = startGame;