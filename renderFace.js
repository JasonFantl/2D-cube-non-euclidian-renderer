
class renderFace {

    constructor(ID, map) {
        this.map = map
        this.ID = ID
        this.Top, this.Bottom, this.Left, this.Right = null

        this.cameraScreen = createGraphics(resolution, resolution);
        this.topView = createGraphics(map.length * 4, map[0].length * 4);
    }

    shootCamera(cam) {
        this.cameraScreen.background(100, 100, 100);
        for (let pixIndex = 0; pixIndex < this.cameraScreen.width; pixIndex++) {

            let cameraX = 2 * pixIndex / float(this.cameraScreen.width) - 1; //x-coordinate in camera space
            let rayDirX = cam.dirX + cam.planeX * cameraX;
            let rayDirY = cam.dirY + cam.planeY * cameraX;

            let returnData = this.shootRay(cam.posX, cam.posY, rayDirX, rayDirY);

            let drawStart = returnData[0];
            let drawEnd = returnData[1];
            let boxColor = returnData[2];

            this.cameraScreen.strokeWeight(1);
            // this.cameraScreen.stroke(30, 40, 100);
            // this.cameraScreen.line(pixIndex, 0, pixIndex, drawStart);
            this.cameraScreen.stroke(boxColor.toP5Color());
            this.cameraScreen.line(pixIndex, drawStart, pixIndex, drawEnd);
        }
    }

    shootRay(rayX, rayY, rayDirX, rayDirY) {

        //which box of the map we're in
        let mapX = int(rayX);
        let mapY = int(rayY);

        //length of ray from current position to next x or y-side
        let sideDistX = null;
        let sideDistY = null;

        //length of ray from one x or y-side to next x or y-side
        let deltaDistX = abs(1 / rayDirX);
        let deltaDistY = abs(1 / rayDirY);
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
        let viewDis = 15;

        while (hit == 0) {

            //only render things withen the distance
            if (perpWallDist > viewDis) {
                let drawStart = -1;
                let drawEnd = -1;
                return [drawStart, drawEnd, new myColor(0, 0, 0)]
            }
            //jump to next map square, OR in x-direction, OR in y-direction
            if (sideDistX < sideDistY) {
                sideDistX += deltaDistX;
                mapX += stepX;
                side = 0;
            } else {
                sideDistY += deltaDistY;
                mapY += stepY;
                side = 1;
            }

            //Check if ray has hit a wall
            if (this.map[mapX][mapY] > 0) hit = 1;

            //Calculate distance projected on camera direction (Euclidean distance will give fisheye effect!)
            if (side == 0) perpWallDist = (mapX - rayX + (1 - stepX) / 2) / rayDirX;
            else perpWallDist = (mapY - rayY + (1 - stepY) / 2) / rayDirY;

        }


        let h = this.cameraScreen.height;
        //Calculate height of line to draw on screen
        let lineHeight = (int)(h / perpWallDist);


        //calculate lowest and highest pixel to fill in current stripe
        let drawStart = (-lineHeight * heightUpCoefficient.value() / 2 + h / 2);
        if (drawStart < 0) drawStart = 0;
        let drawEnd = (lineHeight * heightDownCoefficient.value() / 2 + h / 2);
        if (drawEnd >= h) drawEnd = h - 1;

        //choose wall color
        let boxColor = colorMap(this.map[mapX][mapY])


        //give x and y sides different brightness
        if (side == 1) { boxColor.half(); }

        return [drawStart, drawEnd, boxColor]
    }

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

        let drawX = cam.posX / mapX * graphicsX;
        let drawY = cam.posY / mapY * graphicsY;
        let drawX2 = drawX + cam.dirX;
        let drawY2 = drawY + cam.dirY;

        this.topView.fill(color(20, 20, 200));
        this.topView.circle(drawX, drawY, boxX / 2);
        this.topView.fill(color(200, 20, 200));
        this.topView.circle(drawX2, drawY2, boxX / 2);


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