class View {
    constructor(options) {
        this.canvas = options.canvas;
        this.data = options.data
        this.struct = this.data.struct;
        this.mathem = options.mathem;
    }

    // Отрисовка "коробочек" элементов
    drawBox(coordinates) {
        this.canvas.moveTo(coordinates[0].x * this.data.scale - this.data.cameraXY.x, coordinates[0].y * this.data.scale - this.data.cameraXY.y);
        for (let i = 1; i < coordinates.length; i++) {
                this.canvas.line_(coordinates[i].x * this.data.scale  - this.data.cameraXY.x, coordinates[i].y * this.data.scale - this.data.cameraXY.y);
        }
    }
    
    // Отрисовка комнаты
    drawBuild(build) {
        let RGB
        if (build.isBlock) {
            RGB = 'rgb(128,128,128)';
        } else {
            RGB = 'rgb(255,255,255)';
        }
        this.canvas.beginPath();
        this.drawBox(build.XY[0].points);
        this.canvas.fill(RGB);
        this.canvas.closePath();
    }

    drawDirection(door) {
        this.canvas.beginPath();
        const activeBuilds = this.data.activeBuilds;
        for (let j = 0; j < activeBuilds.length; j++) {
            const room = activeBuilds[j];
            if (room.Id == door.from) {
                if (door.nfrom > 0) {
                    const roomCenter = this.mathem.getCenterPoint(room.XY[0].points)
                    const doorCenter = this.mathem.getCenterPoint(door.doorLink.XY[0].points)
                    let doorSides = [];
                    let roomSides = [];
                    let insertSide;
                    for (let i = 0; i < 4; i++) {
                        doorSides.push([door.doorLink.XY[0].points[i], door.doorLink.XY[0].points[i + 1]]);
                        roomSides.push([room.XY[0].points[i], room.XY[0].points[i + 1]]);
                    }
                    for (let i = 0; i < doorSides.length; i++) {
                        for (let k = 0; k < roomSides.length; k++) {
                            if (this.mathem.isIntersection(doorSides[i][0], doorSides[i][1], roomSides[k][0], roomSides[k][1])) {
                                insertSide = roomSides[k];
                                let tipArrow;
                                if ((roomCenter.x > insertSide[0].x && roomCenter.y < insertSide[0].y && roomCenter.x < insertSide[1].x && roomCenter.y < insertSide[1].y) || 
                                    (roomCenter.x > insertSide[1].x && roomCenter.y < insertSide[1].y && roomCenter.x < insertSide[0].x && roomCenter.y < insertSide[0].y)) {
                                    tipArrow = { x: doorCenter.x, y: doorCenter.y + 0.4 };
                                    this.drawArrow(doorCenter, tipArrow, door.nfrom);
                                } else 
                                if ((roomCenter.x > insertSide[0].x && roomCenter.y > insertSide[0].y && roomCenter.x < insertSide[1].x && roomCenter.y > insertSide[1].y) || 
                                    (roomCenter.x > insertSide[1].x && roomCenter.y > insertSide[1].y && roomCenter.x < insertSide[0].x && roomCenter.y > insertSide[0].y)) {
                                    //вверх
                                    tipArrow = { x: doorCenter.x, y: doorCenter.y - 0.4 };
                                    this.drawArrow(doorCenter, tipArrow, door.nfrom);
                                } else
                                if ((roomCenter.x > insertSide[0].x && roomCenter.y > insertSide[0].y && roomCenter.x > insertSide[1].x && roomCenter.y < insertSide[1].y) || 
                                    (roomCenter.x > insertSide[1].x && roomCenter.y > insertSide[1].y && roomCenter.x > insertSide[0].x && roomCenter.y < insertSide[0].y)) {
                                    tipArrow = { x: doorCenter.x - 0.4, y: doorCenter.y };
                                    this.drawArrow(doorCenter, tipArrow, door.nfrom);
                                } else 
                                if ((roomCenter.x < insertSide[0].x && roomCenter.y > insertSide[0].y && roomCenter.x < insertSide[1].x && roomCenter.y < insertSide[1].y) || 
                                    (roomCenter.x < insertSide[1].x && roomCenter.y > insertSide[1].y && roomCenter.x < insertSide[0].x && roomCenter.y < insertSide[0].y)) {
                                    tipArrow = { x: doorCenter.x + 0.4, y: doorCenter.y };
                                    this.drawArrow(doorCenter, tipArrow, door.nfrom);
                                }
                                break;
                            }
                        }
                    }
                }
            }
        }
    
    }

    drawPeople(people, builds) {
        this.canvas.beginPath();
        for (let i = 0; i < builds.length; i++) {
            if (builds[i].Id == people.uuid) {
                for (let j = 0; j < people.XY.length; j++) {
                    this.canvas.circle(people.XY[j].x * this.data.scale - this.data.cameraXY.x, people.XY[j].y * this.data.scale - this.data.cameraXY.y, this.data.peopleR * this.data.scale, 'red');
                }
                break;
            }
        }
        this.canvas.closePath();
    }
    
    
    // Отрисовка всего
    render() {
        this.canvas.clear();
        for (let i = 0; i < this.data.activeBuilds.length; i++) {
            this.drawBuild(this.data.activeBuilds[i]);
        }
        for (let i = 0; i < this.data.activeDirection.length; i++) {
            this.drawDirection(this.data.activeDirection[i]);
        }
        for (let i = 0; i < this.data.activePeople.length; i++) {
            this.drawPeople(this.data.activePeople[i], this.data.activeBuilds);
        }
        this.canvas.print();
    }

    drawArrow(point1, point2, nfrom) {
        let mainVector = {
            x: (point2.x - point1.x) * nfrom,
            y: (point2.y - point1.y) * nfrom
        }
        let leftPartVector = {
            x: (mainVector.y * (-1) + mainVector.x) / 3,
            y: (mainVector.x + mainVector.y) / 3
        }
        let rightPartVector = {
            x: (mainVector.y + mainVector.x) / 3,
            y: (mainVector.x * (-1) + mainVector.y) / 3
        }
    
        let centerPoint = {
            x: point1.x + mainVector.x,
            y: point1.y + mainVector.y
        }
        let leftPoint = {
            x: point1.x + leftPartVector.x,
            y: point1.y + leftPartVector.y
        }
        let rightPoint = {
            x: point1.x + rightPartVector.x,
            y: point1.y + rightPartVector.y
        }
        
        this.canvas.moveTo(point1.x * this.data.scale - this.data.cameraXY.x, point1.y * this.data.scale - this.data.cameraXY.y);
        this.canvas.line_(centerPoint.x * this.data.scale - this.data.cameraXY.x, centerPoint.y * this.data.scale - this.data.cameraXY.y);

        mainVector.x /= 2;
        mainVector.y /= 2;

        this.canvas.line_(leftPoint.x * this.data.scale - this.data.cameraXY.x, leftPoint.y * this.data.scale - this.data.cameraXY.y);

        this.canvas.moveTo(centerPoint.x * this.data.scale - this.data.cameraXY.x, centerPoint.y * this.data.scale - this.data.cameraXY.y);
        this.canvas.line_(rightPoint.x * this.data.scale - this.data.cameraXY.x, rightPoint.y * this.data.scale - this.data.cameraXY.y);
        
    }

}