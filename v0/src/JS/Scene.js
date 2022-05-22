/*Classe modélisant une scene*/

/*Constructeur d'une scene
    * @param canvas : IDHTML du canvas de rendu*/
function Scene(canvas) {
    //console.log("JE CONSTRUIT UNE SCENE A PARTIR DE");
    //console.log(canvas);

    this.canvas = document.getElementById(canvas);
    this.models = [];
}

Scene.prototype.constructor = Scene;

/*Méthode permettant d'ajouter un modèle à la scène*/
Scene.prototype.ajouterModel = function (model){
    this.models.push(model);
}

/*Méthode permettant d'initialiser une scène*/
Scene.prototype.init = function (){
    try {
        this.gl = this.canvas.getContext("webgl") ||
            this.canvas.getContext("experimental-webgl");
        if ( ! this.gl ) {
            throw "Browser does not support WebGL";
        }
    }
    catch (e) {
        console.log("Sorry, could not get a WebGL graphics context.");
        return;
    }

}

/*Méthode permettant d'initialiser les modèles d'une scène*/
Scene.prototype.initModels = function (){
    for (let i = 0; i < this.models.length; i++) {
        this.models[i].init();
    }
}

/*Méthode permettant de rendre une scène*/
Scene.prototype.rendre = function (){
    for (let i = 0; i < this.models.length; i++) {
        this.models[i].dessiner();
    }
}

/*Méthode permettant d'animer une scène*/
Scene.prototype.update = function (){
    for (let i = 0; i < this.models.length; i++) {
        this.models[i].update();
    }
}

/*Méthode permettant d'assigner une translation à l'ensemble des elements d'une scene*/
Scene.prototype.translation = function (t){
    for (let i = 0; i < this.models.length; i++) {
        this.models[i].appliquerTranslation(t);
    }
}

/*Méthode permettant de reset la position de la scene*/
Scene.prototype.reset = function (){
    for (let i = 0; i < this.models.length; i++) {
        this.models[i].translation = vec3.create();
    }
}

Scene.prototype.clear = function (){
    this.models = [];
}
