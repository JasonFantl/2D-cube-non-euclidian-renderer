const mod = (x, n) => (x % n + n) % n;

let cubeView = null;

let cubeViewRotx = 0;
let cubeViewRoty = 0;

let face1 = null;
let face2 = null;
let face3 = null;
let face4 = null;
let face5 = null;
let face6 = null;

let cam = null;

const resolution = 512;
const moveSpeed = 0.15;
const rotSpeed = 0.08;

class camera {
  constructor() {
    this.face = face1;
    this.posX = 22;
    this.posY = 12;
    this.dirX = -1;
    this.dirY = 0;
    this.planeX = 0;
    this.planeY = 0.66;
    this.viewDis = 100;
  }

  setPos(x, y) {
    this.posX = x;
    this.posY = y;
    //console.log("change in pos to ", this.posY, this.posX);
  }

  getViewDis() {
    return viewSlider.value();
  }
}


let heightUpCoefficient, heightDownCoefficient, viewSlider = null;

function setup() {
  createCanvas(500, 500);
  face1 = new renderFace(1, map1);
  face2 = new renderFace(2, map2);
  face3 = new renderFace(3, map3);
  face4 = new renderFace(4, map4);
  face5 = new renderFace(5, map5);
  face6 = new renderFace(6, map6);

  cam = new camera();

  cubeView = createGraphics(resolution, resolution, WEBGL);

  heightUpCoefficient = createSlider(-1, 4, 1, 0.01);
  heightDownCoefficient = createSlider(-1, 4, 1, 0.01);
  viewSlider = createSlider(3, 100, 80, 1);

  generateAllFaceConnections();
}

function draw() {
  checkKeyboardInput();
  background(0)
  face1.update2D(cam);
  face2.update2D(cam);
  face3.update2D(cam);
  face4.update2D(cam);
  face5.update2D(cam);
  face6.update2D(cam);

  cam.face.shootCamera(cam);

  image(cam.face.cameraScreen, 0, 0, width, height);

  updateCubeView();
  let topViewDelta = width / 2;
  //image(face1.topView, 0, 0, topViewDelta, topViewDelta);
  push();
  scale(-1, 1);
  rotate(PI / 2);
  image(cubeView, width - topViewDelta, 0, topViewDelta, topViewDelta);
  pop();

  text(nf(cam.face.ID) + ": " + nf(cam.posX, 2, 2) + " " + nf(cam.posY, 2, 2), width / 4, height / 4);

}

function checkKeyboardInput() {
  if (keyIsPressed) {
    if (keyIsDown(LEFT_ARROW)) {
      updateCamRot(rotSpeed);
    }
    if (keyIsDown(RIGHT_ARROW)) {
      updateCamRot(-rotSpeed);
    }
    if (keyIsDown(UP_ARROW)) {
      let newX = cam.posX + cam.dirX * moveSpeed;
      let newY = cam.posY + cam.dirY * moveSpeed;
      updateCamPos(newX, newY);
    }
    if (keyIsDown(DOWN_ARROW)) {
      let newX = cam.posX - cam.dirX * moveSpeed;
      let newY = cam.posY - cam.dirY * moveSpeed;
      updateCamPos(newX, newY);
    }
  }
}

function updateCamPos(newX, newY) {

  //check if we've hit an edge
  let didWarp = doWarp(newX, newY);

  if (!didWarp) {
    let nextStepX = cam.posX;
    let nextStepY = cam.posY;

    if (cam.face.map[int(newX)][int(cam.posY)] == 0) {
      nextStepX = newX;
    }
    if (cam.face.map[int(cam.posX)][int(newY)] == 0) {
      nextStepY = newY;
    }

    if (nextStepX != cam.posX || nextStepY != cam.posY) {
      cam.setPos(nextStepX, nextStepY);
    }
  }
}

function updateCamRot(rotAngle) {
  let oldDirX = cam.dirX;
  cam.dirX = cam.dirX * cos(rotAngle) - cam.dirY * sin(rotAngle);
  cam.dirY = oldDirX * sin(rotAngle) + cam.dirY * cos(rotAngle);
  let oldPlaneX = cam.planeX;
  cam.planeX = cam.planeX * cos(rotAngle) - cam.planeY * sin(rotAngle);
  cam.planeY = oldPlaneX * sin(rotAngle) + cam.planeY * cos(rotAngle);

}

function doWarp(x, y) {

  //otherwise get the transformation function and new face
  let newFace = null;
  let faceTransformation = (x, y, xd, yd) => [x, y, xd, yd];

  if (x < 0) {
    newFace = cam.face.Left;
    faceTransformation = cam.face.toLeft;
    console.log("left");
  }
  else if (x >= cam.face.map.length) {
    newFace = cam.face.Right;
    faceTransformation = cam.face.toRight;
    console.log("right");
  }
  else if (y < 0) {
    newFace = cam.face.Bottom;
    faceTransformation = cam.face.toBottom;
    console.log("bottom");
  }
  else if (y >= cam.face.map[0].length) {
    newFace = cam.face.Top;
    faceTransformation = cam.face.toTop;
    console.log("top");
  } else {
    //if no warp, return false
    return false
  }

  //update everything
  cam.face = newFace;
  newCords = faceTransformation(x, y, cam.dirX, cam.dirY);
  cam.setPos(newCords[0], newCords[1]);

  //angle is a bit complicated, check here for refrence: https://www.varsitytutors.com/precalculus-help/find-the-measure-of-an-angle-between-two-vectors
  //no need to divide by magnitude, since theyre both unit vectors
  //Bloody mother fucking floating point error, dotProduct might be one bit off from 1
  let dotProduct = cam.dirX * newCords[2] + cam.dirY * newCords[3];
  if (dotProduct >= 1) {
    dotProduct = 1;
  } else if (dotProduct <= -1) {
    dotProduct = -1
  }
  let deltaAngle = Math.acos(dotProduct);
  //dAngleDir has its sign depending on if its left or right
  let dAngleDir = cam.dirX * (-newCords[3]) + cam.dirY * newCords[2];
  if (dAngleDir > 0) {
    deltaAngle *= -1;
  }
  updateCamRot(deltaAngle);

  return true;
}

function generateAllFaceConnections() {
  face1.Top = face2;
  face1.toTop = (x, y, xd, yd) => [x, y - mapSize, xd, yd];
  face1.Bottom = face5;
  face1.toBottom = (x, y, xd, yd) => [x, mapSize + y, xd, yd];
  face1.Left = face4;
  face1.toLeft = (x, y, xd, yd) => [mapSize + x, y, xd, yd];
  face1.Right = face3;
  face1.toRight = (x, y, xd, yd) => [x - mapSize, y, xd, yd];

  face2.Top = face6;
  face2.toTop = (x, y, xd, yd) => [x, y - mapSize, xd, yd];
  face2.Bottom = face1;
  face2.toBottom = (x, y, xd, yd) => [x, mapSize + y, xd, yd];
  face2.Left = face4;
  face2.toLeft = (x, y, xd, yd) => [mapSize - y, mapSize + x, -yd, xd];
  face2.Right = face3;
  face2.toRight = (x, y, xd, yd) => [y, 2 * mapSize - x, yd, -xd];

  face3.Top = face2;
  face3.toTop = (x, y, xd, yd) => [2 * mapSize - y, x, -yd, xd];
  face3.Bottom = face5;
  face3.toBottom = (x, y, xd, yd) => [mapSize + y, mapSize - x, yd, -xd];
  face3.Left = face1;
  face3.toLeft = (x, y, xd, yd) => [mapSize + x, y, xd, yd];
  face3.Right = face6;
  face3.toRight = (x, y, xd, yd) => [2 * mapSize - x, mapSize - y, -xd, -yd];

  face4.Top = face2;
  face4.toTop = (x, y, xd, yd) => [y - mapSize, mapSize - x, yd, -xd];
  face4.Bottom = face5;
  face4.toBottom = (x, y, xd, yd) => [-y, x, -yd, xd];
  face4.Left = face6;
  face4.toLeft = (x, y, xd, yd) => [-x, mapSize - y, -xd, -yd];
  face4.Right = face1;
  face4.toRight = (x, y, xd, yd) => [mapSize - x, y, xd, yd];

  face5.Top = face1;
  face5.toTop = (x, y, xd, yd) => [x, y - mapSize, xd, yd];
  face5.Bottom = face6;
  face5.toBottom = (x, y, xd, yd) => [x, mapSize + y, xd, yd];
  face5.Left = face4;
  face5.toLeft = (x, y, xd, yd) => [y, -x, yd, -xd];
  face5.Right = face3;
  face5.toRight = (x, y, xd, yd) => [mapSize - y, x - mapSize, -yd, xd];

  face6.Top = face5;
  face6.toTop = (x, y, xd, yd) => [x, y - mapSize, xd, yd];
  face6.Bottom = face2;
  face6.toBottom = (x, y, xd, yd) => [x, mapSize + y, xd, yd];
  face6.Left = face4;
  face6.toLeft = (x, y, xd, yd) => [-x, mapSize - y, -xd, -yd];
  face6.Right = face3;
  face6.toRight = (x, y, xd, yd) => [2 * mapSize - x, mapSize - y, -xd, -yd];
}

function colorMap(data) {
  switch (data) {
    case 1: return new myColor(200, 200, 100); break; //yellow
    case 2: return new myColor(10, 200, 250); break; //blue
    case 3: return new myColor(250, 10, 20); break; //red
    case 4: return new myColor(10, 250, 20); break; //green
    default: return new myColor(230, 235, 235); break; //white
  }
}


//Dont even ask, this thing has been extremely poorly hacked together
function updateCubeView() {

  if (mouseIsPressed) {
    updateCubeViewRot();
  }

  let cubeSize = 100;

  cubeView.background(color(0, 0, 0, 0));

  cubeView.push();
  cubeView.rotateX(cubeViewRotx);
  cubeView.rotateY(cubeViewRoty);

  cubeView.push();
  cubeView.rotateX(-PI / 2);
  cubeView.texture(face4.topView);
  cubeView.quad(
    cubeSize, cubeSize, cubeSize,
    cubeSize, -cubeSize, cubeSize,
    cubeSize, -cubeSize, -cubeSize,
    cubeSize, cubeSize, -cubeSize);
  cubeView.pop();

  cubeView.texture(face3.topView);
  cubeView.push();
  cubeView.rotateX(PI / 2);
  cubeView.rotateY(PI);
  cubeView.quad(
    cubeSize, cubeSize, cubeSize,
    cubeSize, -cubeSize, cubeSize,
    cubeSize, -cubeSize, -cubeSize,
    cubeSize, cubeSize, -cubeSize);
  cubeView.pop();

  cubeView.push();
  cubeView.rotateX(PI);
  cubeView.texture(face5.topView);
  cubeView.quad(
    cubeSize, -cubeSize, cubeSize,
    -cubeSize, -cubeSize, cubeSize,
    -cubeSize, -cubeSize, -cubeSize,
    cubeSize, -cubeSize, -cubeSize);
  cubeView.pop();

  cubeView.texture(face2.topView);
  cubeView.quad(
    cubeSize, -cubeSize, cubeSize,
    -cubeSize, -cubeSize, cubeSize,
    -cubeSize, -cubeSize, -cubeSize,
    cubeSize, -cubeSize, -cubeSize);

  cubeView.texture(face1.topView);
  cubeView.quad(
    cubeSize, cubeSize, cubeSize,
    -cubeSize, cubeSize, cubeSize,
    -cubeSize, -cubeSize, cubeSize,
    cubeSize, -cubeSize, cubeSize);

  cubeView.push();
  cubeView.rotateX(PI);
  cubeView.texture(face6.topView);
  cubeView.quad(
    cubeSize, cubeSize, cubeSize,
    -cubeSize, cubeSize, cubeSize,
    -cubeSize, -cubeSize, cubeSize,
    cubeSize, -cubeSize, cubeSize);
  cubeView.pop();
  cubeView.pop();

}

function updateCubeViewRot() {
  let rate = 0.01;
  let deltaMouseX = -(pmouseY - mouseY) * rate;
  let deltaMouseY = -(mouseX - pmouseX) * rate;

  cubeViewRoty += deltaMouseX;
  cubeViewRotx += deltaMouseY;

}