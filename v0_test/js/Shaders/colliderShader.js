/** TextureGBuffer Classe modélisant la passe géométrique
 * @extends ShaderRenderer
 * Rendu sur :
 *  Scene
 * Utilise :
 *  Rien
 * Permet d'obtenir :
 *  Rien
 */
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

        //this.geometry = {};
        //this.initGeometry();

        console.log(this.geometry);
    }

    /**Méthode permettant de générer la géométrie necessaire à l'affichage du bon collider**/
    initGeometry(){
        this.geometry.cube = {
            vertices : [],
            index : [],
        };
        this.geometry.cube.vertices.push(vec3.clone([-1, -1, 1]));
        this.geometry.cube.vertices.push(vec3.clone([1, -1, 1]));
        this.geometry.cube.vertices.push(vec3.clone([1, 1, 1]));
        this.geometry.cube.vertices.push(vec3.clone([-1, 1, 1]));
        this.geometry.cube.vertices.push(vec3.clone([-1, -1, -1]));
        this.geometry.cube.vertices.push(vec3.clone([1, -1, -1]));
        this.geometry.cube.vertices.push(vec3.clone([1, 1, -1]));
        this.geometry.cube.vertices.push(vec3.clone([-1, 1, -1]));

        this.geometry.cube.index = [
            0, 1, 1, 2, 2, 3, 3, 0,
            4, 5, 5, 6, 6, 7, 7, 4,
            0, 4, 1, 5, 2, 6, 3, 7
        ];

        //===========================================================
        this.geometry.sphere = {
            vertices : [],
            index : [],
        };

        let num_segments = 100;

        for (let ii = 0; ii < num_segments; ii++) {
            let theta = 2.0 * 3.1415926 * ii/num_segments;
            let x = Math.cos(theta);
            let y = Math.sin(theta);
            this.geometry.sphere.vertices.push(vec3.clone([x, y, 0]));
        }

        for (let ii = 0; ii < num_segments; ii++) {
            let theta = 2.0 * 3.1415926 * ii/num_segments;
            let z = Math.cos(theta);
            let x = Math.sin(theta);
            this.geometry.sphere.vertices.push(vec3.clone([x, 0, z]));
        }

        for (let ii = 0; ii < num_segments; ii++) {
            let theta = 2.0 * 3.1415926 * ii/num_segments;
            let z = Math.cos(theta);
            let y = Math.sin(theta);
            this.geometry.sphere.vertices.push(vec3.clone([0, y, z]));
        }

        this.geometry.sphere.index.push(0);
        for (let i = 0; i < num_segments; i++) {
            this.geometry.sphere.index.push(i);
            this.geometry.sphere.index.push(i);
        }
        this.geometry.sphere.index.push(0);

        this.geometry.sphere.index.push(num_segments);
        for (let i = num_segments; i < num_segments * 2; i++) {
            this.geometry.sphere.index.push(i);
            this.geometry.sphere.index.push(i);
        }
        this.geometry.sphere.index.push(num_segments);

        this.geometry.sphere.index.push(2 * num_segments);
        for (let i = 2 * num_segments; i < num_segments * 3; i++) {
            this.geometry.sphere.index.push(i);
            this.geometry.sphere.index.push(i);
        }
        this.geometry.sphere.index.push(2 * num_segments);
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

        //console.log("INIT FROM SCENE !");
        //console.log(scene.camera.getProjectionMatrix());
        //console.log(scene.camera.getViewMatrix());
    }

    /** @inheritdoc*/
    setModelData(model) {
        this.shaderProgram.setUniformValueByName("uModelMatrix",  model.matrix.modelMatrix);
        //this.shaderProgram.setUniformValueByName("uModelMatrix",  mat4.identity([]));
        if(model.collider) {
            this.shaderProgram.setUniformValueByName("uSize", model.collider.dimension);
            this.shaderProgram.setUniformValueByName("uColor", ((model.collider.rayAnswer.hit)? vec3.clone([1,0,0]) : vec3.clone([0,1,0])));
        }
    }

    /** @inheritdoc*/
    shouldRenderOnModel(model) {
        return model.collider != undefined && model.collider.drawn;
    }

    render(scene) {
        this.initFromScene(scene);

        scene.models.forEach(model => {
            if (this.shouldRenderOnModel(model)) {
                if(model.collider.test) {
                    console.log("IM DRAWING ELEMENT COLLIDER !");
                    console.log(this);
                    console.log(model);
                }
                model.collider.test = false;

                this.setModelData(model);
                scene.cube.render(/*gl.LINES*/);
            }
        });
        return this.getRenderResults();
    }
}