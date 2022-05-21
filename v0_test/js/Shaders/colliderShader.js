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
    constructor(shaderProgram, width, height) {
        super(shaderProgram);

        this.renderingMode = RenderingMode.scene;

        this.shaderProgram.setUniform("uModelMatrix",      valType.Mat4fv);
        this.shaderProgram.setUniform("uViewMatrix",       valType.Mat4fv);
        this.shaderProgram.setUniform("uProjectionMatrix", valType.Mat4fv);
        this.shaderProgram.setUniform("uSize", valType.f3v);
        this.shaderProgram.setUniform("uColor", valType.f3v);

        this.shaderProgram.setAllPos();
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
        this.shaderProgram.setUniformValueByName("uModelMatrix",  model.matrix.modelMatrix);
        if(model.collider) {
            this.shaderProgram.setUniformValueByName("uSize", model.collider.dimension);
            this.shaderProgram.setUniformValueByName("uColor", (model.collider.rayAnswer.hit)? vec3.clone([1,0,0]) : vec3.clone([0,1,0]));
        }
    }

    /** @inheritdoc*/
    shouldRenderOnModel(model) {
        return model.invisible != true;
    }
}