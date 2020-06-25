class Logic {
    constructor(options) {
        this.view = options.view;
        this.ui = options.ui;
        this.data  = options.data;

        this.struct = this.data.struct;
        this.level = this.data.level;
        this.choiceBuild = this.data.choiceBuild;
        this.scale = this.data.scale;

        this.mathem = options.mathem;
    }

    /**** ЛОГИКА VIEW ****/

    // Проверка объектов находятся ли они в камере
    isInCamera(XY) {
        for (let i = 0; i < XY.length; i++) {
            if ((XY[i].x * this.data.scale >= this.data.cameraXY.x && XY[i].x * this.data.scale <= this.data.cameraXY.x + this.view.canvas.canvas.width) &&
                (XY[i].y * this.data.scale >= this.data.cameraXY.y && XY[i].y * this.data.scale <= this.data.cameraXY.y + this.view.canvas.canvas.height)) { 
                return true;
            }
        }
        return false;
    }

    // Обновить список объектов в поле камеры
    updateBuildsInCamera() {
        this.data.activeBuilds = [];
        const builds = this.struct.Level[this.data.level].BuildElement;
        for (let i = 0; i < builds.length; i++) {
            if (this.isInCamera(builds[i].XY[0].points)) {
                this.data.activeBuilds.push(builds[i]);
            }
        }
    }

    updateLabel() {
        const timeData = this.data.timeData.items;
        let rooms;
        for (let i = 0; i < timeData.length; i++) {
            if (this.data.time == Math.floor(timeData[i].time)) {
                rooms = timeData[i].rooms;
                break;
            }
        }
        let label  = 0;
        for (let i = 0; i < rooms.length; i++) {
            label += rooms[i].density;
        }
        label = Math.floor(label);
        if (this.data.label !== 0) {
            this.data.exitedLabel += this.data.label - label;
        }
        this.data.label = label;
    }


    updatePeopleInCamera() {
        this.data.activePeople = [];
        const activeBuilds = this.data.activeBuilds;
        const people = this.data.peopleCoordinate;
        for (let i = 0; i < activeBuilds.length; i++) {
            for (let j = 0; j < people.length; j++) {
                if (activeBuilds[i].Id == people[j].uuid) {
                    this.data.activePeople.push(people[j]);
                    break;
                }
            }
        }
    }

    updatePeopleInBuilds() {
        this.data.peopleCoordinate = [];
        const levels = this.struct.Level;
        const timeData = this.data.timeData.items;
        let rooms;
        for (let i = 0; i < timeData.length; i++) {
            if (this.data.time == Math.floor(timeData[i].time)) {
                rooms = timeData[i].rooms;
                break;
            }
        }
        if (rooms) {
            for (let i = 0; i < rooms.length; i++) {
                for (let j = 0; j < levels.length; j++) {
                    let ok = false;
                    for (let k = 0; k < levels[j].BuildElement.length; k++) {
                        if (rooms[i].uuid == levels[j].BuildElement[k].Id) {
                            const XY = this.genPeopleCoordinate(levels[j].BuildElement[k], rooms[i].density);
                            this.data.peopleCoordinate.push({ uuid: rooms[i].uuid, XY: XY });
                            ok = true;
                            break;
                        }
                    }
                    if (ok) {
                        break;
                    }
                }
            }
        }
    }

    genPeopleCoordinate(build, density) {
        const XY = build.XY[0].points;
        let arrayX = [];
        let arrayY = [];
        for (let i = 0; i < XY.length - 1; i++) {
            arrayX.push(XY[i].x);
            arrayY.push(XY[i].y);
        }
        const minXY = this.mathem.toCalculateMinXY(XY);
        const maxXY = this.mathem.toCalculateMaxXY(XY);
        const diagonalXY = { x: maxXY.x - minXY.x, y: maxXY.y - minXY.y };
        const centreXY = { x: diagonalXY.x / 2, y: diagonalXY.y / 2 };
        const peopleCount = Math.floor(density);
        let peopleXY = [];
        for (let i = 0; i <= peopleCount; i++) {
            let randX = this.mathem.getRandomArbitrary(centreXY.x - centreXY.x / 2 + minXY.x, centreXY.x + centreXY.x / 2 + minXY.x);
            let randY = this.mathem.getRandomArbitrary(centreXY.y - centreXY.y / 2 + minXY.y, centreXY.y + centreXY.y / 2 + minXY.y);
            let intersection;
            let ok = true;
            while (ok) {
                intersection = this.mathem.inPoly(randX, randY, arrayX, arrayY);
                if (intersection != 0 && intersection % 2 != 0) {
                    ok = false;
                } else {
                    randX = this.mathem.getRandomArbitrary(centreXY.x - centreXY.x / 2 + minXY.x, centreXY.x + centreXY.x / 2 + minXY.x);
                    randY = this.mathem.getRandomArbitrary(centreXY.y - centreXY.y / 2 + minXY.y, centreXY.y + centreXY.y / 2 + minXY.y);
                }
            }
            peopleXY.push({ x: randX, y: randY });
        }
        return peopleXY;
    }

    // Движение камеры
    moveCamera(value, key) {
        this.updateBuildsInCamera();
        this.updatePeopleInCamera();
        if (key === 'x') {
            if (value > 0) {
                this.data.cameraXY.x -= 0.2 * this.data.scale;
            } else if (value < 0) {
                this.data.cameraXY.x += 0.2 * this.data.scale;
            }
        } else if (key === 'y') {
            if (value > 0) {
                this.data.cameraXY.y -= 0.2 * this.data.scale;
            } else if (value < 0) {
                this.data.cameraXY.y += 0.2 * this.data.scale;
            }
        }
    }

    // Движение мышки
    mouseMove(event) {
        if (this.data.canMove) {
            if (event.movementX) {
                this.moveCamera(event.movementX, 'x');
            } else if (event.movementY) {
                this.moveCamera(event.movementY, 'y');
            }
        }
    }
    
    // Выбрать объект
    toChoiceBuild(event) {
        const mouseX = event.offsetX + this.data.cameraXY.x;
        const mouseY = event.offsetY + this.data.cameraXY.y;
        console.log(mouseX, mouseY);
        let choiceBuild;
        for (let i = 0; i < this.data.activeBuilds.length; i++) {
            let arrayX = [];
            let arrayY = [];
            for (let j = 0; j < this.data.activeBuilds[i].XY[0].points.length - 1; j++) {
                arrayX.push(this.data.activeBuilds[i].XY[0].points[j].x * this.data.scale);
                arrayY.push(this.data.activeBuilds[i].XY[0].points[j].y * this.data.scale);
            }
            const intersection = this.mathem.inPoly(mouseX, mouseY, arrayX, arrayY);
            if (intersection != 0 && intersection % 2 != 0) {
                if (!choiceBuild) {
                    choiceBuild = this.data.activeBuilds[i];
                } else if (this.data.activeBuilds[i].sign == "DoorWayInt" || this.data.activeBuilds[i].sign == "DoorWay") {
                    choiceBuild = this.data.activeBuilds[i];
                    break;
                }
            }
        }
        console.log(choiceBuild);
        this.data.choiceBuild = choiceBuild;
    }

    /****************************************************************************************************/

    // Обновить экран
    updateField() {
        this.view.render();
        this.ui.updateUI();
    }

}