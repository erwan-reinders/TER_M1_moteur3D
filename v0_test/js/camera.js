/*Classe modélisant une camera*/

class Camera {
    /**Constructeur d'une camera
     * @param pos : vec3 position de la camera
     * @param up : vec3 vecteur up de la camera
     * @param target : vec3 cible de la camera **/
    constructor(pos, up, target) {
        this.fieldOfView = 45 * Math.PI / 180;   // in radians
        this.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        this.zNear = 0.1;
        this.zFar = 100.0;

        this.position = pos ?? vec3.clone([0, 0, 5]);
        this.up = up ?? vec3.clone([0, 1, 0]);
        this.target = target ?? vec3.clone([0, 0, 0]);
    }

    getViewMatrix(){
        let viewM = mat4.create();
        mat4.lookAt(viewM, this.position, this.target, this.up);
        return viewM;
    }

    getProjectionMatrix(){
        let PerspecM = mat4.create();
        mat4.perspective(PerspecM, this.fieldOfView, this.aspect, this.zNear, this.zFar);
        return PerspecM;
    }

}