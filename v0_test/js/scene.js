/*Classe modélisant une scene*/
class Scene {
    /**Constructeur d'une scene**/
    constructor() {
        this.models = [];

        this.matrix = {
            projectionMatrix : mat4.create(),
            viewMatrix       : mat4.create(),
            normalMatrix     : mat4.create(),
        }

        this.current_camera = new Camera();
        this.lights = [];

        this.init();
    }

    /**Méthode permettant d'ajouter un modèle à la scène
     * @param model : Model à ajouter à la scène**/
    addModel(model) {
        this.models.push(model);
    }

    /**Méthode permettant d'ajouter une lumière à la scène
     * @param light : Lumière à ajouter à la scène**/
    addLight(light) {
        this.lights.push(light);
    }

    /*Méthode permettant d'initialiser une scène*/
    init() {
        //Initialisation des matrices
        this.matrix.projectionMatrix = this.current_camera.getProjectionMatrix();
        this.matrix.viewMatrix       = this.current_camera.getViewMatrix();
    }

    /*Méthode permettant d'initialiser les modèles d'une scène*/
    initModels() {
        for (let i = 0; i < this.models.length; i++) {
            this.models[i].init();
        }
    }

    /*Méthode permettant de rendre la scène*/
    render() {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        shaders.forEach((v, k) => {
            v.beforeAnyRendering();
        });

        this.matrix.projectionMatrix = this.current_camera.getProjectionMatrix();
        this.matrix.viewMatrix = this.current_camera.getViewMatrix();
        //On rend les modèles de la scène
        for (let i = 0; i < this.models.length; i++) {
            this.models[i].render(this.models[i-1]);
        }
    }

    /*Méthode permettant de clear une scène*/
    clear(){
        this.models = [];
    }
}