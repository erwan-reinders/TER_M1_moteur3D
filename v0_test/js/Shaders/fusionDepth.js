/** FusionDepth Classe shader permettant de générer une texture en comprarant la profondeur de plusieurs textures.
 * @extends ShaderRenderer
 * Rendu sur : 
 *  Quad
 * Utilise :
 *  Liste de textures passée en parametre.
 * Permet d'obtenir :
 *  Texture passée en parametre.
 */
 class FusionDepth extends ShaderRenderer {
    
    /**
     * Construit le faiseur de rendu permettant de fusionner par addition plusieurs images (max 16).
     * @inheritdoc
     * @param {string} textureColorReadNames Les noms des textures de couleur d'entrée.
     * @param {string} textureDepthReadNames Les noms des textures de profondeur d'entrée.
     * @param {string} textureWriteName Le nom de la texture de sortie.
     * @param {number} width  la résolution horizontale du rendu en nombre de pixel.
     * @param {number} height la résolution verticale du rendu en nombre de pixel.
     */
    constructor(shaderProgram, textureColorReadNames, textureDepthReadNames, textureWriteName, width, height) {
        super(shaderProgram);

        this.renderingMode = RenderingMode.quad;

        this.textureColorReadNames = textureColorReadNames;
        this.textureDepthReadNames = textureDepthReadNames;

        this.textureWriteName = textureWriteName;
        
        this.shaderProgram.use();

        this.shaderProgram.setUniform("uNbTextures", valType.i1);

        for (let i = 0; i < 8; i++) {
            this.shaderProgram.setUniform("inputColor"+i, valType.texture2D);
            this.shaderProgram.setUniform("inputDepth"+i, valType.texture2D);
        }

        this.shaderProgram.setAllPos();

        this.framebuffer = new Framebuffer(width, height, 1);
    }

    /** @inheritdoc*/
    usePreviousResult(shaderResults) {
        this.shaderProgram.use();

        this.shaderProgram.setUniformValueByName("uNbTextures", this.textureColorReadNames.length);
        let j = 0;
        for (let i = 0; i < this.textureColorReadNames.length; i++) {
            this.shaderProgram.setUniformValueByName("inputColor"+i, j,   shaderResults.get(this.textureColorReadNames[i]).getTexture());
            this.shaderProgram.setUniformValueByName("inputDepth"+i, j+1, shaderResults.get(this.textureDepthReadNames[i]).getDepth());
            j+=2;
        }
    }

    /** @inheritdoc*/
    getRenderResults() {
        let renderResults = new Array();
        renderResults.push(new ShaderRendererResult(this.textureWriteName, this.framebuffer.textures[0], this));
        return renderResults;
    }

    /** @inheritdoc*/
    initFromScene(scene) {
        Framebuffer.clear();

        this.camera = scene.camera;
        
        this.framebuffer.use();
        this.framebuffer.clearColorAndDepth();

        this.shaderProgram.use();
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