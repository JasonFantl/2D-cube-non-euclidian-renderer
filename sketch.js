const mod = (x, n) => (x % n + n) % n;

let face1 = null;
let face2 = null;
let face3 = null;

let cam = null;

const resolution = 512;
const moveSpeed = 0.15;
const rotSpeed = 0.08;

class camera {
  constructor() {
    this.face = face3;
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
  face3 = new renderFace(3, map5);

  cam = new camera();

  heightUpCoefficient = createSlider(-1, 4, 1, 0.01);
  heightDownCoefficient = createSlider(-1, 4, 1, 0.01);
  viewSlider = createSlider(3, 100, 80, 1);

  face3.Top = face3;
  face3.toTop = (x, y, xd, yd) => [face3.Right.map.length - 1, x, -yd, xd];
  face3.Bottom = face3;
  face3.toBottom = (x, y, xd, yd) => [1, x, -yd, xd];
  face3.Left = face3;
  face3.toLeft = (x, y, xd, yd) => [y, 1, yd, -xd];
  face3.Right = face3;
  face3.toRight = (x, y, xd, yd) => [y, face3.Top.map[0].length - 1, yd, -xd];

  face2.Top = face1;
  face2.toTop = (x, y, xd, yd) => [x, 1, xd, yd];
  face2.Bottom = face1;
  face2.toBottom = (x, y, xd, yd) => [x, face2.Bottom.map.length - 1, xd, yd];
  face2.Left = face1;
  face2.toLeft = (x, y, xd, yd) => [face2.Left.map.length - 1, y, xd, yd];
  face2.Right = face1;
  face2.toRight = (x, y, xd, yd) => [1, y, xd, yd];
}

function draw() {
  checkKeyboardInput();
  background(0)
  cam.face.update2D(cam);
  cam.face.shootCamera(cam);

  image(cam.face.cameraScreen, 0, 0, width, height);

  let topViewDelta = width / 4;
  //image(face1.topView, 0, 0, topViewDelta, topViewDelta);
  push();
  scale(-1, 1);
  rotate(PI / 2);
  image(cam.face.topView, width - topViewDelta, 0, topViewDelta, topViewDelta);
  pop();

  //text(nf(cam.posX, 2, 2) + " " + nf(cam.posY, 2, 2), width / 4, height / 4);

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

  //if no need to warp, return false
  if (x >= 0 && x < cam.face.map.length && y >= 0 && y <= cam.face.map[0].length) {
    return false;
  }

  //otherwise get the transformation function and new face
  let newFace = null;
  let faceTransformation = null;

  if (x < 0) {
    newFace = cam.face.Left;
    faceTransformation = cam.face.toLeft;
  }
  else if (x >= cam.face.map.length) {
    newFace = cam.face.Right;
    faceTransformation = cam.face.toRight;
  }
  else if (y < 0) {
    newFace = cam.face.Bottom;
    faceTransformation = cam.face.toBottom;
  }
  else if (y >= cam.face.map[0].length) {
    newFace = cam.face.Top;
    faceTransformation = cam.face.toTop;
  }

  //update everything
  cam.face = newFace;
  newCords = faceTransformation(x, y, cam.dirX, cam.dirY);
  cam.setPos(newCords[0], newCords[1]);

  //angle is a bit complicated
  let deltaAngle = Math.acos(cam.dirX * newCords[2] + cam.dirY * newCords[3]);
  //dAngleDir has its sign depending on if its left or right
  let dAngleDir = cam.dirX * (-newCords[3]) + cam.dirY * newCords[2];
  if (dAngleDir > 0) {
    deltaAngle *= -1;
  }
  updateCamRot(deltaAngle);

  return true;
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