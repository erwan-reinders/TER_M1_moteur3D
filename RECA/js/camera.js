const Projection = {
    perspective : function() {
        mat4.perspective(this.matrix.projectionMatrix, this.fieldOfView, this.aspect, this.zNear, this.zFar);
    },
    orthographic : function() {
        mat4.ortho(this.matrix.projectionMatrix, this.left, this.right, this.bottom, this.top, this.zNear, this.zFar);
    }
};

/*Classe modélisant une camera*/
class Camera {

    /**Constructeur d'une camera
     * @param {vec3} pos    position de la camera
     * @param {vec3} up     vecteur up de la camera
     * @param {vec3} target cible de la camera **/
    constructor(pos, up, target) {
        //Perpective
        this.fieldOfView = 90 * Math.PI / 180;   // in radians
        //Orthographic
        this.left   = -10.0;
        this.right  =  10.0;
        this.bottom = -10.0;
        this.top    =  10.0;

        this.aspect = gl.canvas.width / gl.canvas.height;
        this.zNear = .1;
        this.zFar = 500.0;

        this.position = pos ?? vec3.clone([0, 0, 5]);
        this.up = up ?? vec3.clone([0, 1, 0]);
        this.target = target ?? vec3.clone([0, 0, 0]);

        this.projection = Projection.perspective;

        this.matrix = {
            projectionMatrix : mat4.create(),
            viewMatrix       : mat4.create(),
        }

    }

    /**
     * Permet de définir la caméra comme ayant une projection par perspective.
     */
    setPerspective() {
        this.projection = Projection.perspective;
    }
    /**
     * Permet de définir la caméra comme ayant une projection orthographique.
     */
    setOrthographic() {
        this.projection = Projection.orthographic;
    }
    /**
     * Modifie la taille et le centre de la projection orthographique.
     * @param {number} size La taille de la projection orthographique (met en place left, right, bottom et up par rapport au centre).
     * @param {number} centerX Le centre sur l'axe X de la caméra.
     * @param {number} centerY Le centre sur l'axe Y de la caméra.
     */
    setOrthographicSize(size, centerX = 0.0, centerY = 0.0) {
        this.left   = centerX-size;
        this.right  = centerX+size;
        this.bottom = centerY-size;
        this.top    = centerY+size;
    }

    /**
     * Permet d'obtenir le vecteur frontal.
     * @returns {Float32Array} Le vecteur correspondant à la direction où regarde la camera.
     */
    getForward() {
        return vec3.normalize([], vec3.subtract([], this.target, this.position));
    }

    /**
     * Met à jour les matrices de la caméra. 
     */
    updateMatrix() {
        this.aspect = canvas.getBoundingClientRect().width / canvas.getBoundingClientRect().height;
        this.updateViewMatrix();
        this.updateProjMatrix();
    }
    updateProjMatrix() {
        this.projection();
    }
    updateViewMatrix() {
        mat4.lookAt(this.matrix.viewMatrix, this.position, this.target, this.up);
    }

    /**
     * Permet d'obtenir la matrice vue de la camera.
     * @returns {Float32Array} La matrice vue de la caméra.
     */
    getViewMatrix(){
        return this.matrix.viewMatrix;
    }

    /**
     * Permet d'obtenir la matrice de projection de la camera.
     * @returns {Float32Array} La matrice de projection de la caméra.
     */
    getProjectionMatrix(){
        return this.matrix.projectionMatrix;
    }
}