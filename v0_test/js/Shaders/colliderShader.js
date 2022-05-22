/** TextureGBuffer Classe modélisant la passe géométrique
 * @extends ShaderRenderer
 * Rendu sur :
 *  Scene
 * Utilise :
 *  Rien
 * Permet d'obtenir :
 *  Rien
 */

//let aff = true;
let aff = false;

class ColliderShader extends ShaderRenderer {
    /**
     * Construit le faiseur de rendu permettant de générer des colliders
     * @inheritdoc
     * @param {number} width  la résolution horizontale du rendu en nombre de pixel.
     * @param {number} height la résolution verticale du rendu en nombre de pixel.
     */
    constructor(shaderProgram, width = canvas.width, height= canvas.height) {
        super(shaderProgram);

        this.renderingMode = RenderingMode.scene;

        this.shaderProgram.setUniform("uModelMatrix",       valType.Mat4fv);
        this.shaderProgram.setUniform("uViewMatrix",        valType.Mat4fv);
        this.shaderProgram.setUniform("uProjectionMatrix",  valType.Mat4fv);
        this.shaderProgram.setUniform("uSize",              valType.f3v);
        this.shaderProgram.setUniform("uColor",             valType.f3v);
        this.shaderProgram.setAllPos();


        this.x = 0;
        this.y = 0;
        this.width = canvas.width;
        this.height = canvas.height;

        this.models = {};
        this.initModels();
        //console.log(this.models);
    }

    /**Méthode permettant de générer la géométrie necessaire à l'affichage du bon collider**/
    initModels(){
        let vertices = [];

        vertices.push(-.5, -.5, .5);
        vertices.push(.5, -.5, .5);
        vertices.push(.5, .5, .5);
        vertices.push(-.5, .5, .5);
        vertices.push(-.5, -.5, -.5);
        vertices.push(.5, -.5, -.5);
        vertices.push(.5, .5, -.5);
        vertices.push(-.5, .5, -.5);
        let index = [
            0, 1, 1, 2, 2, 3, 3, 0,
            4, 5, 5, 6, 6, 7, 7, 4,
            0, 4, 1, 5, 2, 6, 3, 7
        ];

        let normals     = [];
        let texCoords   = [];
        for (let i = 0; i < 8; i++) {
            normals.push(0,0,0);
            texCoords.push(0,0,0);
        }

        this.models.cube = new Model({
            vertexPositions         : new Float32Array(vertices),
            vertexNormals           : new Float32Array(normals),
            vertexTextureCoords     : new Float32Array(texCoords),
            indices                 : new Uint16Array(index)
        });

        //===========================================================
        let num_segments = 100;
        let vertices_sphere = [];
        let index_sphere = [];

        for (let ii = 0; ii < num_segments; ii++) {
            let theta = 2.0 * 3.1415926 * ii/num_segments;
            let x = Math.cos(theta) * .5;
            let y = Math.sin(theta) * .5;
            vertices_sphere.push(x, y, 0);
        }

        for (let ii = 0; ii < num_segments; ii++) {
            let theta = 2.0 * 3.1415926 * ii/num_segments;
            let z = Math.cos(theta) * .5;
            let x = Math.sin(theta) * .5;
            vertices_sphere.push(x, 0, z);
        }

        for (let ii = 0; ii < num_segments; ii++) {
            let theta = 2.0 * 3.1415926 * ii/num_segments;
            let z = Math.cos(theta) * .5;
            let y = Math.sin(theta) * .5;
            vertices_sphere.push(0, y, z);
        }

        index_sphere.push(0);
        for (let i = 0; i < num_segments; i++) {
            index_sphere.push(i);
            index_sphere.push(i);
        }
        index_sphere.push(0);

        index_sphere.push(num_segments);
        for (let i = num_segments; i < num_segments * 2; i++) {
            index_sphere.push(i);
            index_sphere.push(i);
        }
        index_sphere.push(num_segments);

        index_sphere.push(2 * num_segments);
        for (let i = 2 * num_segments; i < num_segments * 3; i++) {
            index_sphere.push(i);
            index_sphere.push(i);
        }
        index_sphere.push(2 * num_segments);

        let normals_sphere     = [];
        let texCoords_sphere   = [];
        for (let i = 0; i < num_segments*3; i++) {
            normals_sphere.push(0,0,0);
            texCoords_sphere.push(0,0,0);
        }

        this.models.sphere = new Model({
            vertexPositions         : new Float32Array(vertices_sphere),
            vertexNormals           : new Float32Array(normals_sphere),
            vertexTextureCoords     : new Float32Array(texCoords_sphere),
            indices                 : new Uint16Array(index_sphere)
        });
    }

    /** @inheritdoc*/
    usePreviousResult(shaderResults) {
        // On n'utilise pas de précédent résultat.
    }

    /** @inheritdoc*/
    getRenderResults() {
        gl.enable(gl.DEPTH_TEST);
        return new Array();
    }

    /** @inheritdoc*/
    initFromScene(scene) {
        Framebuffer.clear();
        this.shaderProgram.use();
        gl.viewport(this.x, this.y, this.width, this.height);
        gl.disable(gl.DEPTH_TEST);
        this.shaderProgram.setUniformValueByName("uProjectionMatrix", scene.camera.getProjectionMatrix());
        this.shaderProgram.setUniformValueByName("uViewMatrix",       scene.camera.getViewMatrix());
    }

    /** @inheritdoc*/
    setModelData(model) {
        let model_mat = mat4.identity([]);
        model_mat[12] = model.collider.position[0];
        model_mat[13] = model.collider.position[1];
        model_mat[14] = model.collider.position[2];

        let orientationm4;
        if(model.collider.orientation) {
            orientationm4 = mat4.clone([
                model.collider.orientation[0], model.collider.orientation[1], model.collider.orientation[2], 0,
                model.collider.orientation[3], model.collider.orientation[4], model.collider.orientation[5], 0,
                model.collider.orientation[6], model.collider.orientation[7], model.collider.orientation[8], 0,
                0, 0, 0, 1,
            ]);
        }else{
            orientationm4 = mat4.identity([]);
        }
        this.shaderProgram.setUniformValueByName("uModelMatrix", mat4.multiply([], orientationm4, model_mat));
        //this.shaderProgram.setUniformValueByName("uModelMatrix",  mat4.identity([]));
        if(model.collider) {
            this.shaderProgram.setUniformValueByName("uSize", vec3.scale([],model.collider.dimension,2));
            this.shaderProgram.setUniformValueByName("uColor", ((model.collider.rayAnswer.hit)? vec3.clone([1,0,0]) : vec3.clone([0,1,0])));
        }
    }

    /** @inheritdoc*/
    shouldRenderOnModel(model) {
        return model.collider != undefined && model.collider.drawn;
    }

    render(scene) {
        this.initFromScene(scene);
        /*raycastPoll.forEach(ray => {
            this.shaderProgram.setUniformValueByName("uModelMatrix",  mat4.identity([]));
            this.shaderProgram.setUniformValueByName("uSize", vec3.clone([1,1,1]));
            this.shaderProgram.setUniformValueByName("uColor", vec3.clone([0,1,0]));
            ray.model.render(gl.LINES);
        });*/

        scene.models.forEach(model => {
            if (this.shouldRenderOnModel(model)) {
                model.collider.test = false;
                this.setModelData(model);
                if(model.collider.type === colliderType.CUBE) {
                    this.models.cube.render(gl.LINES);
                }else if(model.collider.type === colliderType.SPHERE) {
                    this.models.sphere.render(gl.LINES);
                }
            }
        });
        return this.getRenderResults();
    }
}