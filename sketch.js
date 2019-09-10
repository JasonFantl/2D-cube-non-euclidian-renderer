const mod = (x, n) => (x % n + n) % n


const resolution = 512;
const moveSpeed = 0.1;
const rotSpeed = 0.05;

var map1 = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 2, 2, 0, 2, 2, 0, 0, 0, 0, 3, 0, 3, 0, 3, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 4, 0, 4, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 4, 0, 0, 0, 0, 5, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 4, 0, 4, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 4, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

class camera {
  constructor() {
    this.posX = 22;
    this.posY = 12;
    this.dirX = -1;
    this.dirY = 0;
    this.planeX = 0;
    this.planeY = 0.66;
    this.viewDis = 200;
  }
}

let cam = null;
let face1 = null;


let heightUpCoefficient, heightDownCoefficient = null;

function setup() {
  createCanvas(500, 500);
  face1 = new renderFace(1, map1);
  cam = new camera();

  face1.showFOV = true;

  heightUpCoefficient = createSlider(-1, 4, 1, 0.01);
  heightDownCoefficient = createSlider(-1, 4, 1, 0.01);

}

function draw() {
  updatePosition();
  background(0)
  face1.update2D(cam);
  face1.shootCamera(cam);

  image(face1.cameraScreen, 0, 0, width, height);

  let topViewDelta = width / 4;
  //image(face1.topView, 0, 0, topViewDelta, topViewDelta);
  push();
  scale(-1, 1);
  rotate(PI / 2);
  image(face1.topView, width - topViewDelta, 0, topViewDelta, topViewDelta);
  pop();

}

function updatePosition() {
  if (keyIsPressed) {
    if (keyIsDown(LEFT_ARROW)) {
      let oldDirX = cam.dirX;
      cam.dirX = cam.dirX * cos(rotSpeed) - cam.dirY * sin(rotSpeed);
      cam.dirY = oldDirX * sin(rotSpeed) + cam.dirY * cos(rotSpeed);
      let oldPlaneX = cam.planeX;
      cam.planeX = cam.planeX * cos(rotSpeed) - cam.planeY * sin(rotSpeed);
      cam.planeY = oldPlaneX * sin(rotSpeed) + cam.planeY * cos(rotSpeed);
    }
    if (keyIsDown(RIGHT_ARROW)) {
      let oldDirX = cam.dirX;
      cam.dirX = cam.dirX * cos(-rotSpeed) - cam.dirY * sin(-rotSpeed);
      cam.dirY = oldDirX * sin(-rotSpeed) + cam.dirY * cos(-rotSpeed);
      let oldPlaneX = cam.planeX;
      cam.planeX = cam.planeX * cos(-rotSpeed) - cam.planeY * sin(-rotSpeed);
      cam.planeY = oldPlaneX * sin(-rotSpeed) + cam.planeY * cos(-rotSpeed);
    }
    if (keyIsDown(UP_ARROW)) {
      let newX = mod(cam.posX + cam.dirX * moveSpeed, map1.length);
      let newY = mod(cam.posY + cam.dirY * moveSpeed, map1[0].length);

      if (map1[int(newX)][int(cam.posY)] == 0) {
        cam.posX = newX;
      }
      if (map1[int(cam.posX)][int(newY)] == 0) {
        cam.posY = newY;
      }
    }
    if (keyIsDown(DOWN_ARROW)) {
      let newX = mod(cam.posX - cam.dirX * moveSpeed, map1.length);
      let newY = mod(cam.posY - cam.dirY * moveSpeed, map1[0].length);

      if (map1[int(newX)][int(cam.posY)] == 0) {
        cam.posX = newX;
      }
      if (map1[int(cam.posX)][int(newY)] == 0) {
        cam.posY = newY;
      }
    }
  }
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