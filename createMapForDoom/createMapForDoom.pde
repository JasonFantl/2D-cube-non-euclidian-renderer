

int[][] outArr = new int[25][25];

void setup() {
  size(500, 500);
  background(51);
  for (int x = 0; x < outArr.length; x++) {
    for (int y = 0; y < outArr[x].length; y++) {
      outArr[x][y] = 0;
    }
  }
}


void draw() {
  for (int x = 0; x < outArr.length; x++) {
    for (int y = 0; y < outArr[x].length; y++) {
      PVector pos = new PVector(x, y).div(outArr.length).mult(width);
      fill(colorMap(outArr[x][y]));
      square(pos.x, pos.y, width/outArr.length);
    }
  }
}

void mousePressed() {

  PVector pos = new PVector(mouseX, mouseY).div(width).mult(outArr.length);

  int x = (int)pos.x;
  int y = (int)pos.y;

  outArr[x][y] = (outArr[x][y] + 1)%5;
}

void keyPressed() {
  print("[\n");

  for (int x = 0; x < outArr.length; x++) {
    print("[");
    for (int y = 0; y < outArr[x].length; y++) {
      print(outArr[x][y]);
       if (y != outArr[x].length - 1) {
      print(", ");
    }
    }
    
    print("]");
    if (x != outArr.length - 1) {
      print(",\n");
    }
  }
    println("\n];");

}

color colorMap(int i) {
  switch (i) {
  case 1: 
    return color(10, 10, 10); //red
  case 2: 
    return color(10, 200, 250); //green
  case 3: 
    return color(250, 10, 20); //blue
  case 4: 
    return color(10, 250, 20); //white
  default: 
    return color(230, 235, 235); //yellow
  }
}
