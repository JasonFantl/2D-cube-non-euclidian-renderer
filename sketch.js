const mod = (x, n) => (x % n + n) % n;

let face1 = null;
let face2 = null;

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
    this.viewDis = 200;
  }
}


let heightUpCoefficient, heightDownCoefficient = null;

function setup() {
  createCanvas(500, 500);
  face1 = new renderFace(1, map1);
  face2 = new renderFace(2, map2);

  cam = new camera();

  heightUpCoefficient = createSlider(-1, 4, 1, 0.01);
  heightDownCoefficient = createSlider(-1, 4, 1, 0.01);

  let flipX = (map, x) => (map.length + x);
  let flipY = (map, y) => (map[0].length + y);

  face1.Top = face2;
  face1.toTop = (x, y, xd, yd) => [x, 0, xd, yd];
  face1.Bottom = face2;
  face1.toBottom = (x, y, xd, yd) => [x, flipY(face2.Bottom.map, y), xd, yd];
  face1.Left = face2;
  face1.toLeft = (x, y, xd, yd) => [flipX(face1.Left.map, x), y, xd, yd];
  face1.Right = face2;
  face1.toRight = (x, y, xd, yd) => [0, y, xd, yd];

  face2.Top = face1;
  face2.toTop = (x, y, xd, yd) => [x, 0, xd, yd];
  face2.Bottom = face1;
  face2.toBottom = (x, y, xd, yd) => [x, flipY(face2.Bottom.map, y), xd, yd];
  face2.Left = face1;
  face2.toLeft = (x, y, xd, yd) => [flipX(face2.Left.map, x), y, xd, yd];
  face2.Right = face1;
  face2.toRight = (x, y, xd, yd) => [0, y, xd, yd];
}

function draw() {
  updatePosition();
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

}

function updatePosition() {
  if (keyIsPressed) {
    if (keyIsDown(LEFT_ARROW)) {
      updateCamRot(1);
    }
    if (keyIsDown(RIGHT_ARROW)) {
      updateCamRot(-1);
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
  let newCords = [newX, newY];

  let hitFace = cam.face;
  if (newX < 0) {
    hitFace = cam.face.Left;
    newCords = cam.face.toLeft(newX, newY, 0, 0);
  }
  else if (newX >= cam.face.map.length) {
    hitFace = cam.face.Right;
    newCords = cam.face.toRight(newX, newY, 0, 0);
  }
  else if (newY < 0) {
    hitFace = cam.face.Bottom;
    newCords = cam.face.toBottom(newX, newY, 0, 0);
  }
  else if (newY >= cam.face.map[0].length) {
    hitFace = cam.face.Top;
    newCords = cam.face.toTop(newX, newY, 0, 0);
  }

  let canGoX = false;
  let canGoY = false;

  if (hitFace.map[int(newCords[0])][int(cam.posY)] == 0) {
    canGoX = true;
    cam.face = hitFace;
  }
  if (hitFace.map[int(cam.posX)][int(newCords[1])] == 0) {
    canGoY = true;
    cam.face = hitFace;
  }
  if (canGoX) {
    cam.posX = newCords[0];
  }
  if (canGoY) {
    cam.posY = newCords[1];
  }
}


function updateCamRot(direction) {
  let oldDirX = cam.dirX;
  cam.dirX = cam.dirX * cos(direction * rotSpeed) - cam.dirY * sin(direction * rotSpeed);
  cam.dirY = oldDirX * sin(direction * rotSpeed) + cam.dirY * cos(direction * rotSpeed);
  let oldPlaneX = cam.planeX;
  cam.planeX = cam.planeX * cos(direction * rotSpeed) - cam.planeY * sin(direction * rotSpeed);
  cam.planeY = oldPlaneX * sin(direction * rotSpeed) + cam.planeY * cos(direction * rotSpeed);
}

function colorMap(data) {
  switch (data) {
    case 1: return new myColor(10, 10, 10); break; //red
    case 2: return new myColor(10, 200, 250); break; //green
    case 3: return new myColor(250, 10, 20); break; //blue
    case 4: return new myColor(10, 250, 20); break; //white
    default: return new myColor(255, 255, 255); break; //yellow
  }
}