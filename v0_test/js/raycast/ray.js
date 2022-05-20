/*Classe modélisant un rayon*/
class Ray {

    /**
    * Conctructeur d'un rayon
    * @param {Float32Array} origine du rayon
    * @param {Float32Array} direction du rayon
    **/
    constructor(origine, direction) {
        this.origine    =   origine ?? vec3.create();
        this.direction  =   direction ?? vec3.create();
    }


    /**
     * Permet de construire un rayon depuis l'écran
     * @param {Float32Array} viewportPoint vec2 point de l'écran
     * @param {Float32Array} viewportOrigin vec2 point de début de l'écran
     * @param {Float32Array} viewportSize vec2 taille de l'écran
     * @param {Float32Array} view mat4 matrice de vue
     * @param {Float32Array} projection vec4 matrice de projection
     * **/
    getPickRay(viewportPoint, viewportOrigin, viewportSize,view, projection) {
        let nearPoint   = vec3.clone([viewportPoint[0], viewportPoint[1], 0.0]);
        let farPoint    = vec3.clone([viewportPoint[0], viewportPoint[1], 1.0]);

        let pNear   = unproject(nearPoint, viewportOrigin, viewportSize, view, projection);
        let pFar    = unproject(farPoint, viewportOrigin, viewportSize, view, projection);

        console.log("UNPROJECT");
        console.log(pNear);
        console.log(pFar);


        let normal = vec3.normalize([], vec3.subtract([], pFar, pNear));
        this.origine = pNear;
        this.direction = normal;
    }
}