/** Skybox Classe shader permettant de une skybox
 * @extends ShaderRenderer
 * Rendu sur : 
 *  Cube
 * Utilise :
 *  La profondeur du framebuffer de la passe géométrique (Position)
 * Permet d'obtenir :
 *  Skybox
 */
 class Skybox extends ShaderRenderer {
    
    /**
     * Construit le faiseur de rendu permettant de dessiner un éclairage BlinnPhong.
     * @inheritdoc
     * @param {string} textureReadName Le nom de la texture d'entrée.
     * @param {Cubemap} cubemapObject La cubemap à afficher.
     * @param {number} width  la résolution horizontale du rendu en nombre de pixel.
     * @param {number} height la résolution verticale du rendu en nombre de pixel.
     */
    constructor(shaderProgram, cubemapObject, width, height) {
        super(shaderProgram);

        this.renderingMode = RenderingMode.cube;

        this.cubemap = cubemapObject;
        
        this.shaderProgram.use();

        this.shaderProgram.setUniform("uProjectionMatrix", valType.Mat4fv);
        this.shaderProgram.setUniform("uViewMatrix",       valType.Mat4fv);

        this.shaderProgram.setUniform("skybox", valType.textureCubeMap);

        this.shaderProgram.setAllPos();

        this.framebuffer = new Framebuffer(width, height, 1);
    }

    /** @inheritdoc*/
    usePreviousResult(shaderResults) {
        gl.depthFunc(gl.LEQUAL);
        gl.disable(gl.CULL_FACE);

        this.framebuffer.use();
        this.framebuffer.clearColorAndDepth();
        this.framebuffer.copyBitsOf(shaderResults.get("Position").getFramebuffer(), gl.DEPTH_BUFFER_BIT);
    }

    /** @inheritdoc*/
    getRenderResults() {
        gl.depthFunc(gl.LESS);
        gl.enable(gl.CULL_FACE);
        
        let renderResults = new Array();
        renderResults.push(new ShaderRendererResult("Skybox", this.framebuffer.textures[0], this));
        return renderResults;
    }

    /** @inheritdoc*/
    initFromScene(scene) {
        this.camera = scene.camera;
        
        this.framebuffer.use();

        this.shaderProgram.use();

        this.shaderProgram.setUniformValueByName("uProjectionMatrix", this.camera.getProjectionMatrix());
        this.shaderProgram.setUniformValueByName("uViewMatrix",       this.camera.getViewMatrix());

        if (this.cubemap.ready) {
            this.shaderProgram.setUniformValueByName("skybox", 0, this.cubemap.texture);
        }
        else {
            this.shaderProgram.setUniformValueByName("skybox", 0, loadingCubemap.texture);
        }
    }

    /** @inheritdoc*/
    setModelData(model) {
        // On ne fait pas de rendu sur les modèles
    }

    /** @inheritdoc*/
    shouldRenderOnModel(model) {
        return false;
    }
}