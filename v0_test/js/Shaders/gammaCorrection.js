/** GammaCorrection Classe shader permettant de générer une texture corrigé
 * @extends ShaderRenderer
 * Rendu sur : 
 *  Quad
 * Utilise :
 *  Texture passée en parametre.
 * Permet d'obtenir :
 *  Texture passée en parametre.
 */
class GammaCorrection extends ShaderRenderer {
    
    /**
     * Construit le faiseur de rendu permettant d'effectuer le traitement de correction gamma.
     * @inheritdoc
     * @param {string} textureReadName Le nom de la texture d'entrée.
     * @param {string} textureWriteName Le nom de la texture de sortie.
     * @param {number} width  la résolution horizontale du rendu en nombre de pixel.
     * @param {number} height la résolution verticale du rendu en nombre de pixel.
     */
    constructor(shaderProgram, textureReadName, textureWriteName, width, height) {
        super(shaderProgram);

        this.renderingMode = RenderingMode.quad;

        this.textureReadName = textureReadName;
        this.textureWriteName = textureWriteName;

        this.gamma = 2.2;
        
        this.shaderProgram.use();

        this.shaderProgram.setUniform("inputColor", valType.texture2D);
        this.shaderProgram.setUniform("gamma", valType.f1);

        this.shaderProgram.setAllPos();

        this.framebuffer = new Framebuffer(width, height, 1);
    }

    /** @inheritdoc*/
    usePreviousResult(shaderResults) {
        this.shaderProgram.use();

        this.shaderProgram.setUniformValueByName("inputColor", 0, shaderResults.get(this.textureReadName).getTexture());
    }

    /** @inheritdoc*/
    getRenderResults() {
        let renderResults = new Array();
        renderResults.push(new ShaderRendererResult(this.textureWriteName , this.framebuffer.textures[0], this));
        return renderResults;
    }

    /** @inheritdoc*/
    initFromScene(scene) {
        Framebuffer.clear();

        this.camera = scene.camera;
        
        this.framebuffer.use();
        this.framebuffer.clearColorAndDepth();

        this.shaderProgram.use();

        this.shaderProgram.setUniformValueByName("gamma", this.gamma);
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