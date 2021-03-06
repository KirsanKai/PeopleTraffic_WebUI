class App {
    constructor() {
        // Инициализация настроек, сервера, инструментария канвас и модуля отрисовки
        this.BASE_SETTINGS = new BASE_SETTINGS();
        this.server = new Server(this.BASE_SETTINGS.SERVER);
        this.canvas = new Canvas(this.BASE_SETTINGS.CANVAS);
        this.mathem = new Mathem();
        this.data = {
            struct: this.server.data,
            blocking: {
                doors: [],
                elements: [
                    {
                        uuid: "8a1ff353-de4d-429b-95e6-dc5744d2a8cb",
                        time: 10
                    }
                ]
            },

            timerTimeDataUpdatePause: true,
            timerSpeedUp: 1,
            timeData: timeData,
            currentTimeData: null,
            time: 0,
            timeStep: 1,
            
            gifFinish: false,
            isGifStop: false,
            passFrame: 0,

            cameraXY: { x: 0, y: 0 },
            canMove: false,
            scale: 20,
            fieldWidth: this.canvas.canvas.width,
            fieldHeight: this.canvas.canvas.height,

            level: 0,
            choiceBuild: null,
            activeBuilds: [],
            activeDirection: [],

            activePeople: [],
            peopleCoordinate: [],
            maxNumPeople: 5,
            peopleDen: 1,
            peopleR: 0.25,
            label: 0,
            exitedLabel: 0
        }
        this.view = new View({ canvas: this.canvas, data: this.data, mathem: this.mathem });
        this.ui = new UI({ data: this.data, mathem: this.mathem });
        this.logic = new Logic({ view: this.view, ui: this.ui, data: this.data, mathem: this.mathem });
        this.encoder = new GIFEncoder();

        // Инициализация первичных настроек
        this.init();
    }

    init() {
        this.logic.updateCurrentTimeData();
        this.logic.toInitialCoordination();
        this.logic.toScreenAdjustment();
        this.logic.updatePeopleInBuilds();
        this.logic.updatePeopleInCamera();
        this.logic.updateLabel();
        // Вешаем слушатели событий
        document.addEventListener('keydown', (event) => {
            console.log(event.keyCode);
            switch (event.keyCode) {
                // Повысить этаж
                case 38: 
                    this.data.level += (this.data.level + 1 < this.data.struct.Level.length) ? 1 : 0;
                    break;
                // Понизить этаж
                case 40:
                    this.data.level -= (this.data.level - 1 >= 0) ? 1 : 0;
                    break;
                // Увеличить zoom
                case 107:
                case 187:
                    this.data.scale++;
                    console.log(this.data.scale);
                    break;
                // Уменьшить zoom
                case 189:
                case 109:
                    this.data.scale--;
                    console.log(this.data.scale);
                    break;
            }
            this.logic.updateBuildsInCamera();
            this.logic.updatePeopleInCamera();
            this.logic.updateDirectionInCamera();
        });
        document.getElementById('canvas_container').addEventListener('wheel', (event) => {
            let dir = Math.sign(event.deltaY);
            switch (dir) {
                case -1: // Увеличить zoom
                    this.data.scale+=0.5;
                    break;
                case +1: // Уменьшить zoom
                    this.data.scale-=0.5;
                    break;
            }
            this.logic.updateBuildsInCamera();
            this.logic.updatePeopleInCamera();
        });
        this.canvas.canvas.addEventListener('mousedown', () => { this.data.canMove = true; });
        this.canvas.canvas.addEventListener('mouseup', () => { this.data.canMove = false; });
        this.canvas.canvas.addEventListener('mouseout', () => { this.data.canMove = false; });
        this.canvas.canvas.addEventListener('mousemove', (event) => { this.logic.mouseMove(event); });
        this.canvas.canvas.addEventListener('dblclick', (event) => {
            this.logic.toChoiceBuild(event);
        });

        //this.gifInit(1000); // Инициализация настроек 
        
        let timerRenderId = setInterval(() => this.updateField(), 100);
        let timerTimeDataUpdateId = setInterval(() => this.updateTimeData(), 500);
        // Закончить GIF и создать её
        // let timerGifFinish = setTimeout(() => {
        //     this.data.gifFinish = true;
        //     this.encoder.finish();
        //     this.encoder.download("newGif.gif");
        // }, 5500);
    }

    updateField() {
        console.log('Go!');
        this.logic.updateField();
    }

    updateTimeData() {
        if (!this.data.timerTimeDataUpdatePause) {
            this.data.time += this.data.timeStep;
            this.logic.updateCurrentTimeData();
            this.logic.updateBuildsInCamera();
            this.logic.updatePeopleInBuilds();
            this.logic.updatePeopleInCamera();
            this.logic.updateDirectionInCamera();
            this.logic.updateLabel();
            this.ui.updateUI();
            //this.gifNewFrame();
        }

        if (this.data.isGifStop) {
            this.encoder.finish();
            this.encoder.download("newGif.gif");
            this.data.isGifStop = false;
        }
    }

    // Инициализация настроек
    gifInit(delayTimer) {
        this.encoder.start();
        this.encoder.setRepeat(0);
        this.encoder.setDelay(delayTimer);
        this.encoder.setSize(this.canvas.canvas.width, this.canvas.canvas.height);
    }

    // Добавить новый кадр
    gifNewFrame() {
        this.encoder.addFrame(this.canvas.memContext);
    }

}
