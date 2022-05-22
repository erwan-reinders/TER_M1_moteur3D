/** DepthMap Classe shader permettant de générer une carte de prodondeur.
 * @extends ShaderRenderer
 * Rendu sur : 
 *  Scene
 * Utilise :
 *  Rien
 * Permet d'obtenir :
 *  {R} {CameraSpace} DepthMap : La carte de profondeur.
 */
class DepthMap extends ShaderRenderer {
    /** 
     * Construit le faiseur de rendu permettant de générer une carte de profondeur.
     * @inheritdoc
     * @param {Camera} camera La caméra donnant le point de vue de la carte de profondeur.
     * @param {number} width  La résolution horizontale du rendu en nombre de pixel.
     * @param {number} height La résolution verticale du rendu en nombre de pixel.
     */
    constructor(shaderProgram, camera, width, height, prettyZFar = false) {
        super(shaderProgram);

        this.renderingMode = RenderingMode.scene;

        this.camera = camera;
        this.prettyZFar = prettyZFar;

        this.shaderProgram.setUniform("uModelMatrix",      valType.Mat4fv);
        this.shaderProgram.setUniform("uViewMatrix",       valType.Mat4fv);
        this.shaderProgram.setUniform("uProjectionMatrix", valType.Mat4fv);

        this.shaderProgram.setAllPos();

        this.framebuffer = new Framebuffer(width, height, 1, false);
        this.framebuffer.framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer.framebuffer);

        this.framebuffer.textures[0] = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.framebuffer.textures[0]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.framebuffer.textures[0], 0);

        gl.drawBuffers([gl.NONE]);
        gl.readBuffer(gl.NONE);

        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
            message.error("DEPTHMAP FRAMEBUFFER INIT", "Framebuffer not complete!");

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    /** @inheritdoc*/
    usePreviousResult(shaderResults) {
        // On n'utilise pas de précédent résultat.
    }

    /** @inheritdoc*/
    getRenderResults() {
        gl.cullFace(gl.BACK);
        let renderResults = new Array();
        renderResults.push(new ShaderRendererResult("DepthMap", this.framebuffer.textures[0], this));
        return renderResults;
    }

    /** @inheritdoc*/
    initFromScene(scene) {
        if (this.prettyZFar) {
            this.camera.zFar = 2.0 * vec3.dist(this.camera.position, this.camera.target);
        }
        this.camera.updateMatrix();
        //this.camera = scene.camera;

        this.framebuffer.use();
        this.framebuffer.clear(gl.DEPTH_BUFFER_BIT);

        this.shaderProgram.use();

        this.shaderProgram.setUniformValueByName("uProjectionMatrix", this.camera.getProjectionMatrix());
        this.shaderProgram.setUniformValueByName("uViewMatrix",       this.camera.getViewMatrix());

        gl.cullFace(gl.FRONT);
    }

    /** @inheritdoc*/
    setModelData(model) {
        this.shaderProgram.setUniformValueByName("uModelMatrix",  model.matrix.modelMatrix);
    }

    /** @inheritdoc*/
    shouldRenderOnModel(model) {
        return model.invisibleDepth != true;
    }
}