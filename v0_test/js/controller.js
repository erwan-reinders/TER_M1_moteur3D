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
     * @param {Scene} scene La scene que l'on vas modifier.
     */
    constructor(scene) {
        this.keyControls = new Map();
        this.mouseControls = new Map();
        this.scene = scene;
        this.initControls();
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

        this.mouseControls.set("drag", new Input(1));
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
        if (event.key == "+") {
            currentPipeline++;
            if (currentPipeline >= pipelines.length) {
                currentPipeline = 0;
            }
        }
        if (event.key == "o") {
        }
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
        //console.log(event);
        // if (this.mouseControls.get("drag").value) {
        //     console.log(event.clientX + " " + event.clientY);
        // }
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
        let move = vec3.create();

        let cameraForward = this.scene.camera.getForward();
        let cameraUp = this.scene.camera.up;
        let cameraRight = vec3.normalize([], vec3.cross([], cameraUp, cameraForward));
        cameraUp = vec3.normalize([], vec3.cross([], cameraForward, cameraRight));

        let speed = 0.1;
        let speedVec = vec3.fromValues(speed, speed, speed);
        let speedVecInv = vec3.fromValues(-speed, -speed, -speed);
        
        if (this.keyControls.get("right").value) {
            vec3.add(move, move, vec3.multiply([], cameraRight, speedVec));
        }
        if (this.keyControls.get("left").value) {
            vec3.add(move, move, vec3.multiply([], cameraRight, speedVecInv));
        }
        if (this.keyControls.get("up").value) {
            vec3.add(move, move, vec3.multiply([], cameraUp, speedVec));
        }
        if (this.keyControls.get("down").value) {
            vec3.add(move, move, vec3.multiply([], cameraUp, speedVecInv));
        }
        if (this.keyControls.get("forward").value) {
            vec3.add(move, move, vec3.multiply([], cameraForward, speedVec));
        }
        if (this.keyControls.get("backward").value) {
            vec3.add(move, move, vec3.multiply([], cameraForward, speedVecInv));
        }
        vec3.add(this.scene.camera.position, this.scene.camera.position, move);
        //vec3.add(scene.current_light.position, scene.current_light.position, move);
    }
}