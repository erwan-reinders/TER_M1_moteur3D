/** ExtractColorByBrigthness Classe shader permettant d'extraire les couleurs si la luminace est au dessu du seuil.
 * @extends ShaderRenderer
 * Rendu sur : 
 *  Quad
 * Utilise :
 *  Texture passée en parametre.
 * Permet d'obtenir :
 *  Texture passée en parametre.
 */
class ExtractColorByBrigthness extends ShaderRenderer {
    
    /**
     * Construit le faiseur de rendu permettant d'effectuer le traitement de correction gamma.
     * @inheritdoc
     * @param {number} seuil Le seuil minimum d'extraction.
     * @param {Float32Array} defaultColor la couleur à mettre si on ne passe pas le test.
     * @param {string} textureReadName Le nom de la texture d'entrée.
     * @param {string} textureWriteName Le nom de la texture de sortie.
     * @param {number} width  la résolution horizontale du rendu en nombre de pixel.
     * @param {number} height la résolution verticale du rendu en nombre de pixel.
     */
    constructor(shaderProgram, seuil, defaultColor, textureReadName, textureWriteName, width, height) {
        super(shaderProgram);

        this.renderingMode = RenderingMode.quad;

        this.textureReadName = textureReadName;
        this.textureWriteName = textureWriteName;

        this.seuil = seuil;
        this.defaultColor = defaultColor;
        
        this.shaderProgram.use();

        this.shaderProgram.setUniform("inputColor",   valType.texture2D);
        this.shaderProgram.setUniform("seuil",        valType.f1);
        this.shaderProgram.setUniform("defaultColor", valType.f4v);

        this.shaderProgram.setAllPos();

        this.framebuffer = new Framebuffer(width, height, 1, false);
        this.framebuffer.init(gl.LINEAR, gl.CLAMP_TO_EDGE);
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

        this.shaderProgram.setUniformValueByName("seuil",        this.seuil);
        this.shaderProgram.setUniformValueByName("defaultColor", this.defaultColor);
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