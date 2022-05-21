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

        //this.initDataDrawing();
        this.t = 0;
    }

    initDataDrawing(){
        let vertices = [];

        let c_sw1 = [-0.05, 0.0, 0.0];   // bottom left swing
        let c_sw2 = [-0.05, 0.0, 0.0];    // bottom right swing

        vertices.push(
            this.origine[0],
            this.origine[1],
            this.origine[2],
            this.origine[0]+ this.direction[0]*this.t,
            this.origine[1]+ this.direction[1]*this.t,
            this.origine[2]+ this.direction[2]*this.t,
            this.origine[0]+ (this.direction[0]+ c_sw1[0])*this.t,
            this.origine[1]+ (this.direction[1]+ c_sw1[1])*this.t,
            this.origine[2]+ (this.direction[2]+ c_sw1[2])*this.t,
            this.origine[0]+(this.direction[0]+ c_sw2[0])*this.t,
            this.origine[1]+(this.direction[1]+ c_sw2[1])*this.t,
            this.origine[2]+(this.direction[2]+ c_sw2[2])*this.t,
        );

        //console.log(vertices);
        let index = [0, 1, 2, 1, 3, 1];
        let normals     = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        let texCoords   = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

        this.model = new Model({
            vertexPositions         : new Float32Array(vertices),
            vertexNormals           : new Float32Array(normals),
            vertexTextureCoords     : new Float32Array(texCoords),
            indices                 : new Uint16Array(index)
        });
    }

    /**
     * Permet de construire un rayon depuis l'écran
     * @param {Float32Array} viewportPoint vec2 point de l'écran
     * @param {Float32Array} viewportOrigin vec2 point de début de l'écran
     * @param {Float32Array} viewportSize vec2 taille de l'écran
     * @param {Float32Array} view mat4 matrice de vue
     * @param {Float32Array} projection vec4 matrice de projection
     * **/
    getPickRay(viewportPoint, viewportOrigin, viewportSize,view, projection, pos) {
        let nearPoint   = vec3.clone([viewportPoint[0], viewportPoint[1], -1.0]);
        let farPoint    = vec3.clone([viewportPoint[0], viewportPoint[1], 1.0]);
        let pNear   = unproject(nearPoint, viewportOrigin, viewportSize, view, projection);
        let pFar    = unproject(farPoint, viewportOrigin, viewportSize, view, projection);
        let normal = vec3.normalize([], vec3.subtract([], pFar, pNear));
        this.origine = pNear;
        this.direction = normal;
    }


    /*TEST UNPROJECT*/
    getPickRayBis(viewportPoint, viewportOrigin, viewportSize,camera) {
        this.origine =  camera.position;
        //this.origine =  vec3.clone([viewportPoint[0],viewportPoint[1], camera.position[2]]);
        this.direction = unprojectBis(camera,viewportPoint, viewportOrigin, viewportSize);
    }

    getPickRayOrtho(viewportPoint, viewportOrigin, viewportSize, camera) {
        this.origine = unproject(vec3.clone([viewportPoint[0], viewportPoint[1], 0.0]), viewportOrigin, viewportSize, camera.getViewMatrix(), camera.getProjectionMatrix());
        this.direction = camera.getForward();
    }
}