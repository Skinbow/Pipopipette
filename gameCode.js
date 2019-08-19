/*global
  myGameArea,
  wallTextures,
  stickTextures
*/

var
//Functions
  mouseState,
  startGame,
  updateGame;

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
    myGameArea.sticks[i].update(myGameArea.sticks[i].collisionBox.collidesWithPoint(mouseState.x, mouseState.y));
  }
  for (i = 0; i < myGameArea.wallSegments.length; i += 1) {
    myGameArea.wallSegments[i].update();
  }
};

window.onload = startGame;