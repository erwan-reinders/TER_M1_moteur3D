/** Shadow Classe shader permettant savoir si un fragment est à l'ombre ou non.
 * @extends ShaderRenderer
 * Rendu sur : 
 *  Quad
 * Utilise :
 *  {RGB}  {ScreenSpace} Position      : Les coordonées mondes
 *  {R}    {CameraSpace} DepthMap      : La carte de profondeur.
 * Permet d'obtenir :
 *  {R}    {ScreenSpace} Shadow        : Les valeurs d'ombrage.
 */
class Shadow extends ShaderRenderer {
    
    /**
     * Construit le faiseur de rendu permettant de calculer les valeurs d'ombrages.
     * @inheritdoc
     * @param {number} width  la résolution horizontale du rendu en nombre de pixel.
     * @param {number} height la résolution verticale du rendu en nombre de pixel.
     */
    constructor(shaderProgram, width, height) {
        super(shaderProgram);

        this.renderingMode = RenderingMode.quad;

        this.bias = 0.002;
        
        this.shaderProgram.use();

        this.shaderProgram.setUniform("gPosition", valType.texture2D);
        this.shaderProgram.setUniform("depthMap",  valType.texture2D);

        this.shaderProgram.setUniform("uDepthViewMatrix",       valType.Mat4fv);
        this.shaderProgram.setUniform("uDepthProjectionMatrix", valType.Mat4fv);

        this.shaderProgram.setUniform("uBias", valType.f1);

        this.shaderProgram.setAllPos();

        this.framebuffer = new Framebuffer(width, height, 1);
    }

    /** @inheritdoc*/
    usePreviousResult(shaderResults) {
        this.shaderProgram.use();

        this.shaderProgram.setUniformValueByName("gPosition", 0, shaderResults.get("Position").getTexture());

        let depthMapResult = shaderResults.get("DepthMap");
        this.shaderProgram.setUniformValueByName("depthMap",               1, depthMapResult.getTexture());
        this.shaderProgram.setUniformValueByName("uDepthViewMatrix",       depthMapResult.getCamera().getViewMatrix());
        this.shaderProgram.setUniformValueByName("uDepthProjectionMatrix", depthMapResult.getCamera().getProjectionMatrix());
    }

    /** @inheritdoc*/
    getRenderResults() {
        let renderResults = new Array();
        renderResults.push(new ShaderRendererResult("Shadow", this.framebuffer.textures[0], this));
        return renderResults;
    }

    /** @inheritdoc*/
    initFromScene(scene) {
        Framebuffer.clear();

        this.camera = scene.camera;
        
        this.framebuffer.use();
        this.framebuffer.clearColorAndDepth();

        this.shaderProgram.use();
        
        this.shaderProgram.setUniformValueByName("uBias", this.bias);
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