
class renderFace {

    constructor(ID, map) {
        this.map = map
        this.ID = ID
        this.Top, this.Bottom, this.Left, this.Right = null
        this.toTop, this.toBottom, this.toLeft, this.toRight = null

        this.cameraScreen = createGraphics(resolution, resolution);
        this.topView = createGraphics(map.length * 4, map[0].length * 4);

        this.showFOV = true;
        this.numOfRays = 30;
    }

    shootCamera(cam) {
        this.cameraScreen.background(100, 100, 100);
        for (let pixIndex = 0; pixIndex < this.cameraScreen.width; pixIndex++) {

            //calculate direction of ray
            let cameraX = 2 * pixIndex / float(this.cameraScreen.width) - 1; //x-coordinate in camera space
            let rayDirX = cam.dirX + cam.planeX * cameraX;
            let rayDirY = cam.dirY + cam.planeY * cameraX;

            let returnData = this.shootRay(cam.posX, cam.posY, rayDirX, rayDirY, 0, pixIndex, 0);

            let drawStart = returnData[0];
            let drawEnd = returnData[1];
            let boxColor = returnData[2];


            //Draw the line onto the canvas
            this.cameraScreen.strokeWeight(1);
            this.cameraScreen.stroke(boxColor.toP5Color());
            this.cameraScreen.line(pixIndex, drawStart, pixIndex, drawEnd);
        }
    }

    shootRay(rayX, rayY, rayDirX, rayDirY, disTravelled, pixIndex, blocksTransversed) {

        if (blocksTransversed > 100) { //just incase of recursion error
            return [1, 110, new myColor(0, 0, 0)];
        }

        let totalDisTraveled = disTravelled;

        //Setup all the variables we need

        //which box of the map we're in
        let mapX = int(rayX);
        let mapY = int(rayY);

        //length of ray from current position to next x or y-side
        let sideDistX = null;
        let sideDistY = null;

        //length of ray from one x or y-side to next x or y-side
        let deltaDistX = abs(1 / rayDirX);
        let deltaDistY = abs(1 / rayDirY);

        //Number of boxs crossed
        let perpWallDist = null;

        //what direction to step in x or y-direction (either +1 or -1)
        let stepX = null;
        let stepY = null;


        let hit = 0; //was there a wall hit?
        let side = null; //was a NS or a EW wall hit?
        //calculate step and initial sideDist
        if (rayDirX < 0) {
            stepX = -1;
            sideDistX = (rayX - mapX) * deltaDistX;
        }
        else {
            stepX = 1;
            sideDistX = (mapX + 1.0 - rayX) * deltaDistX;
        }
        if (rayDirY < 0) {
            stepY = -1;
            sideDistY = (rayY - mapY) * deltaDistY;
        }
        else {
            stepY = 1;
            sideDistY = (mapY + 1.0 - rayY) * deltaDistY;
        }

        //perform DDA
        while (hit == 0) {
            //stop rendering if past render distance
            if (totalDisTraveled > cam.getViewDis()) {
                return [-1, -1, new myColor(0, 0, 0)]
            }

            //jump to next map square in x-direction OR in y-direction
            if (sideDistX < sideDistY) {
                sideDistX += deltaDistX;
                mapX += stepX;
                side = 0;
            } else {
                sideDistY += deltaDistY;
                mapY += stepY;
                side = 1;
            }

            //Calculate distance projected on camera direction (Euclidean distance will give fisheye effect!)
            //It calculates the number of boxs crossed
            if (side == 0) perpWallDist = (mapX - rayX + (1 - stepX) / 2) / rayDirX;
            else perpWallDist = (mapY - rayY + (1 - stepY) / 2) / rayDirY;

            totalDisTraveled = perpWallDist + disTravelled;

            //Wrap the ray to always be inside the map
            let hitRayX = rayX + perpWallDist * rayDirX;
            let hitRayY = rayY + perpWallDist * rayDirY;
            let newCords;
            let hitFace = null;
            if (mapX < 0) {
                hitFace = this.Left;
                newCords = this.toLeft(hitRayX, hitRayY, rayDirX, rayDirY);
            } else if (mapY < 0) {
                hitFace = this.Bottom;
                newCords = this.toBottom(hitRayX, hitRayY, rayDirX, rayDirY);
            } else if (mapX >= this.map.length) {
                hitFace = this.Right;
                newCords = this.toRight(hitRayX, hitRayY, rayDirX, rayDirY);
            } else if (mapY >= this.map[0].length) {
                hitFace = this.Top;
                newCords = this.toTop(hitRayX, hitRayY, rayDirX, rayDirY);
            }
            if (hitFace) {
                if (this.showFOV && pixIndex % this.numOfRays == 0) {
                    this.drawLineOnTop(rayX, rayY, hitRayX, hitRayY);
                }
                return hitFace.shootRay(newCords[0], newCords[1], newCords[2], newCords[3], totalDisTraveled, pixIndex, blocksTransversed + 1);
            }

            //Check if ray has hit a wall
            if (this.map[mapX][mapY] > 0) hit = 1;
        }

        //draw ray on top view        
        if (this.showFOV && pixIndex % this.numOfRays == 0) {
            let hitRayX = rayX + perpWallDist * rayDirX;
            let hitRayY = rayY + perpWallDist * rayDirY;
            this.drawLineOnTop(rayX, rayY, hitRayX, hitRayY);
        }

        totalDisTraveled = perpWallDist + disTravelled;

        let h = this.cameraScreen.height;
        //Calculate height of line to draw on screen
        let lineHeight = (int)(h / totalDisTraveled);


        //calculate lowest and highest pixel to fill in current stripe
        let drawStart = (-lineHeight * heightUpCoefficient.value() / 2 + h / 2);
        if (drawStart < 0) drawStart = 0;
        let drawEnd = (lineHeight * heightDownCoefficient.value() / 2 + h / 2);
        if (drawEnd >= h) drawEnd = h - 1;

        //choose wall color
        let boxColor = colorMap(this.map[mapX][mapY])


        //give x and y sides different brightness
        if (side == 1) { boxColor.half(); }

        //Ajust brightness based on distance
        let fadeDis = 10;
        if (totalDisTraveled > fadeDis) {
            boxColor.div(totalDisTraveled / fadeDis)
        }

        return [drawStart, drawEnd, boxColor]
    }

    drawLineOnTop(rayX, rayY, hitRayX, hitRayY) {
        let mapX = this.map.length;
        let mapY = this.map[0].length;
        let graphicsX = this.topView.width;
        let graphicsY = this.topView.height;

        let xFactor = float(graphicsX) / mapX;
        let yFactor = float(graphicsY) / mapY;

        this.topView.strokeWeight(this.numOfRays / 100);
        this.topView.stroke(250, 10, 10);

        this.topView.line(rayX * xFactor, rayY * yFactor, hitRayX * xFactor, hitRayY * yFactor);
    }

    //Updates the top down view of the world
    update2D(cam) {
        let mapX = this.map.length;
        let mapY = this.map[0].length;
        let graphicsX = this.topView.width;
        let graphicsY = this.topView.height;
        let boxX = graphicsX / mapX;
        let boxY = graphicsY / mapY;

        for (let x = 0; x < mapX; x++) {
            for (let y = 0; y < mapY; y++) {
                let col = colorMap(this.map[x][y]);
                let drawX = (float(x) / mapX) * graphicsX;
                let drawY = (float(y) / mapY) * graphicsY;

                this.topView.fill(col.toP5Color());
                this.topView.noStroke();
                this.topView.rect(drawX, drawY, boxX, boxY);
            }
        }


        if(cam.face.ID == this.ID) {
        let drawX = cam.posX / mapX * graphicsX;
        let drawY = cam.posY / mapY * graphicsY;
        let drawX2 = drawX + cam.dirX;
        let drawY2 = drawY + cam.dirY;

        this.topView.fill(color(20, 20, 200));
        this.topView.circle(drawX, drawY, boxX / 2);
        this.topView.fill(color(200, 20, 200));
        this.topView.circle(drawX2, drawY2, boxX / 2);

        this.topView.circle(0, 0, 10);
        }
    }
}

class myColor {
    constructor(r, g, b) {
        this.red = r;
        this.green = g;
        this.blue = b;
    }

    half() {
        this.red /= 2;
        this.green /= 2;
        this.blue /= 2;
    }

    mult(multiplier) {
        this.red *= multiplier;
        this.green *= multiplier;
        this.blue *= multiplier;
    }
    div(divider) {
        this.red /= divider;
        this.green /= divider;
        this.blue /= divider;
    }
    toP5Color() {
        return color(this.red, this.green, this.blue);
    }
}