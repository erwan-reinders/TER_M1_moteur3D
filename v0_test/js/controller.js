/**
 * Classe modélisant un bouton. Permet de connaître l'état du bouton correspondant.
 */
class Input {
    /**
     * Construit une entrée.
     * @param {string} name Le nom de l'évenement à detecter.
     */
    constructor(name) {
        this.name = name;
        this.value = false;
    }
}

/**
 * Classe modélisant les comportements à exécuter lors qu'une touche est enfoncée.
 */
class Controller {

    /**
     * Construit le controleur.
     */
    constructor() {
        this.keyControls    = new Map();
        this.mouseControls  = new Map();
        this.initControls();

        this.previousMouseX = 0.0;
        this.previousMouseY = 0.0;
        this.mouseDiffX = 0.0;
        this.mouseDiffY = 0.0;

        this.scrollingAmount = 0.2;

        this.azimuth = 1.5;
        this.zenith  = 0.0;
        this.radius  = 5.0;
    }

    /**
     * Initialise les touches à capter.
     */
    initControls() {
        this.keyControls.set("up",       new Input("ArrowUp"));
        this.keyControls.set("down",     new Input("ArrowDown"));
        this.keyControls.set("left",     new Input("ArrowRight"));
        this.keyControls.set("right",    new Input("ArrowLeft"));
        this.keyControls.set("forward",  new Input("z"));
        this.keyControls.set("backward", new Input("s"));
        this.mouseControls.set("drag", new Input(2));
    }

    /**
     * Met à jour la liste des évenements clavier lors d'un appui.
     * @param {KeyboardEvent} event L'evenement clavier reçut par callback.
     */
    onKeyDown(event) {
        for (let input of this.keyControls) {
            if (event.key == input[1].name) {
                input[1].value = true;
            }
        }

        if (event.key == "p") {
            updateRender = !updateRender;
        }
        if (event.key == "Enter") {
            currentPipeline++;
            if (currentPipeline >= pipelines.length) {
                currentPipeline = 0;
            }
        }
        if (event.key == "Backspace") {
            currentScene++;
            if (currentScene >= scenes.length) {
                currentScene = 0;
            }
        }
        if (event.key == "o") {
        }

        //console.log(event.key);
    }

    /**
     * Met à jour la liste des évenements clavier lors d'un relachement.
     * @param {KeyboardEvent} event L'evenement clavier reçut par callback.
     */
    onKeyUp(event) {
        for (let input of this.keyControls) {
            if (event.key == input[1].name) {
                input[1].value = false;
            }
        }
    }

    /**
     * Met à jour la liste des évenements souris lors d'un déplacement.
     * @param {MouseEvent} event L'evenement souris reçut par callback.
     */
    onMouseMove(event) {
        this.mouseDiffX = event.clientX - this.previousMouseX;
        this.mouseDiffY = event.clientY - this.previousMouseY;
        this.previousMouseX = event.clientX;
        this.previousMouseY = event.clientY;
    }

    onWheel(event) {
        this.radius += Math.sign(event.deltaY) * this.scrollingAmount * this.radius;
    }

    /**
     * Met à jour la liste des évenements souris lors d'un appui.
     * @param {MouseEvent} event L'evenement souris reçut par callback.
     */
    onMouseDown(event) {
        for (let input of this.mouseControls) {
            if (event.buttons == input[1].name) {
                input[1].value = true;
            }
        }
    }

    /**
     * Met à jour la liste des évenements souris lors d'un relachement.
     * @param {MouseEvent} event L'evenement souris reçut par callback.
     */
    onMouseUp(event) {
        for (let input of this.mouseControls) {
            input[1].value = false;
        }
    }

    /**
     * Modifie la scene en fonction de l'état des entrées.
     */
    processInput() {
        let mouseSpeed = 0.005;
        
        if (this.mouseControls.get("drag").value) {
            this.azimuth    += Math.floor(this.mouseDiffX) * mouseSpeed;
            this.zenith     += Math.floor(this.mouseDiffY) * mouseSpeed;
        }

        let keyboardSpeed = 0.05;
        
        if (this.keyControls.get("right").value) {
            this.azimuth += keyboardSpeed;
        }
        if (this.keyControls.get("left").value) {
            this.azimuth -= keyboardSpeed;
        }
        if (this.keyControls.get("up").value) {
            this.zenith += keyboardSpeed;
        }
        if (this.keyControls.get("down").value) {
            this.zenith -= keyboardSpeed;
        }
        if (this.keyControls.get("forward").value) {
            this.radius -= keyboardSpeed * this.radius * 0.5;
        }
        if (this.keyControls.get("backward").value) {
            this.radius += keyboardSpeed * this.radius * 0.5;
        }
        
        if (this.zenith > 1.57)
            this.zenith = 1.57;
        if (this.zenith < -1.57)
            this.zenith = -1.57;
        if (this.radius < 0.1)
            this.radius = 0.1;
            
        let x = this.radius * Math.cos(this.azimuth) * Math.cos(this.zenith);
        let y = this.radius * Math.sin(this.zenith);
        let z = this.radius * Math.sin(this.azimuth) * Math.cos(this.zenith);
        scenes[currentScene].camera.position = vec3.fromValues(x, y, z);

        this.mouseDiffX = 0.0;
        this.mouseDiffY = 0.0;
    }
}