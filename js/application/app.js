class App {
    constructor() {
        // Инициализация настроек, сервера, инструментария канвас и модуля отрисовки
        this.BASE_SETTINGS = new BASE_SETTINGS();
        this.server = new Server(this.BASE_SETTINGS.SERVER);
        this.canvas = new Canvas(this.BASE_SETTINGS.CANVAS);
        this.mathem = new Mathem();
        this.data = {
            struct: this.server.data,
            timerTimeDataUpdatePause: true,
            timerSpeedUp: 1,
            timeData: timeData,
            time: 0,
            timeStep: 1,
            
            cameraXY: { x: 0, y: 0 },
            canMove: false,
            scale: 20,

            level: 0,
            choiceBuild: null,
            activeBuilds: [],

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


        // Инициализация первичных настроек
        this.init();


    }

    init() {
        this.logic.updateBuildsInCamera();
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
                    break;
                // Уменьшить zoom
                case 189:
                case 109:
                    this.data.scale--;
                    break;
            }
            this.logic.updateBuildsInCamera();
            this.logic.updatePeopleInCamera();
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
        let timerRenderId = setInterval(() => this.updateField(), 100);
        let timerTimeDataUpdateId = setInterval(() => this.updateTimeData(), 1000);
    }

    updateField() {
        console.log('Go!');
        this.logic.updateField();
    }

    updateTimeData() {
        if (!this.data.timerTimeDataUpdatePause) {
            this.data.time += this.data.timeStep;
            this.logic.updatePeopleInBuilds();
            this.logic.updatePeopleInCamera();
            this.logic.updateLabel();
            this.ui.updateUI();
        }
    }
}
