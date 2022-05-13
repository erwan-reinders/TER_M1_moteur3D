/** Classe modélisant une scene */
class Scene {
    /**Constructeur d'une scene*/
    constructor() {
        this.camera = new Camera();
        
        this.models = [];
        this.quad = new Model(quad());
        this.lights = [];

        this.init();
    }

    /**Méthode permettant d'ajouter un modèle à la scène
     * @param model Model à ajouter à la scène */
    addModel(model) {
        this.models.push(model);
    }

    /**Méthode permettant d'ajouter une lumière à la scène
     * @param light : Lumière à ajouter à la scène */
    addLight(light) {
        this.lights.push(light);
    }

    /** Méthode permettant d'initialiser une scène */
    init() {

    }

    /** Méthode permettant d'initialiser les modèles d'une scène */
    initModels() {
        this.models.forEach(model => model.init());
    }

    /**
     * Met à jour la scene.
     */
    update() {
        this.camera.updateMatrix();
        this.models.forEach(model => model.update());
    }

    /*Méthode permettant de clear une scène*/
    clear(){
        this.models = [];
    }
}