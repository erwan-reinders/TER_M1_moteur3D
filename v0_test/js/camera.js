/*Classe modélisant une camera*/
class Camera {

    /**Constructeur d'une camera
     * @param {vec3} pos    position de la camera
     * @param {vec3} up     vecteur up de la camera
     * @param {vec3} target cible de la camera **/
    constructor(pos, up, target) {
        this.fieldOfView = 90 * Math.PI / 180;   // in radians
        this.aspect = gl.canvas.width / gl.canvas.height;
        this.zNear = .1;
        this.zFar = 500.0;

        this.position = pos ?? vec3.clone([0, 0, 5]);
        this.up = up ?? vec3.clone([0, 1, 0]);
        this.target = target ?? vec3.clone([0, 0, 0]);

        this.matrix = {
            projectionMatrix : mat4.create(),
            viewMatrix       : mat4.create(),
        }
    }

    /**
     * Permet d'obtenir le vecteur frontal.
     * @returns Le vecteur correspondant à la direction où regarde la camera.
     */
    getForward() {
        return vec3.normalize([], vec3.subtract([], this.target, this.position));
    }

    /**
     * Met à jour les matrices de la caméra. 
     */
    updateMatrix() {
        mat4.lookAt(this.matrix.viewMatrix, this.position, this.target, this.up);
        mat4.perspective(this.matrix.projectionMatrix, this.fieldOfView, this.aspect, this.zNear, this.zFar);
    }

    /**
     * Permet d'obtenir la matrice vue de la camera.
     * @returns la matrice vue de la caméra.
     */
    getViewMatrix(){
        return this.matrix.viewMatrix;
    }

    /**
     * Permet d'obtenir la matrice de projection de la camera.
     * @returns la matrice de projection de la caméra.
     */
    getProjectionMatrix(){
        return this.matrix.projectionMatrix;
    }
}