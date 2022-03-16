/*Classe modélisant une scene*/
class Scene {
    /**Constructeur d'une scene
    * @param canvas : ID_HTML du canvas de rendu**/
    constructor(canvas) {
        this.canvas = document.getElementById(canvas);
        this.models = [];

        this.matrix = {
            projectionMatrix : mat4.create(),
            viewMatrix       : mat4.create(),
            normalMatrix     : mat4.create(),
        }
        this.current_camera = new Camera();

        this.programInfo = {
            uniformLocations : {
                projectionMatrix : 'uProjectionMatrix',
                normalMatrix     : 'uNormalMatrix',
                viewMatrix       :  'uViewMatrix',
            }
        };
    }

    /**Méthode permettant d'ajouter un modèle à la scène
     * @param model : Model à ajouter à la scène**/
    addModel(model) {
        this.models.push(model);
    }

    /*Méthode permettant d'initialiser une scène*/
    init() {
        try {
            this.gl = this.canvas.getContext("webgl") ||
                this.canvas.getContext("experimental-webgl");
            if (!this.gl) {
                throw "Browser does not support WebGL";
            }
        } catch (e) {
            console.log("Sorry, could not get a WebGL graphics context.");
            return;
        }

        //Initialisation des matrices
        mat4.perspective(this.matrix.projectionMatrix, this.current_camera.fieldOfView, this.current_camera.aspect, this.current_camera.zNear, this.current_camera.zFar);
        //mat4.identity(this.matrix.modelMatrix);
        mat4.lookAt(this.matrix.viewMatrix, this.current_camera.position, this.current_camera.target, this.current_camera.up);
        mat4.invert(this.matrix.normalMatrix, mat4.identity());
        mat4.transpose(this.matrix.normalMatrix, this.matrix.normalMatrix);
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

        //On rend les modèles de la scène
        for (let i = 0; i < this.models.length; i++) {
            gl.useProgram(this.models[i].prog);
            //Pour les élem uniformes
            gl.uniformMatrix4fv(gl.getAttribLocation(this.models[i].prog, this.programInfo.uniformLocations.projectionMatrix), false, this.matrix.projectionMatrix);
            gl.uniformMatrix4fv(gl.getAttribLocation(this.models[i].prog, this.programInfo.uniformLocations.viewMatrix), false, this.matrix.viewMatrix);
            gl.uniformMatrix4fv(gl.getAttribLocation(this.models[i].prog, this.programInfo.uniformLocations.normalMatrix), false, this.matrix.normalMatrix);

            this.models[i].render();

        }
        // gl.activeTexture(gl.TEXTURE0);
        // gl.bindTexture(gl.TEXTURE_2D, texture);
        // gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    }

    /*Méthode permettant de clear une scène*/
    clear(){
        this.models = [];
    }
}