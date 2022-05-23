/** Fusion Classe shader permettant de générer une texture en additionnant plusieurs textures.
 * @extends ShaderRenderer
 * Rendu sur : 
 *  Quad
 * Utilise :
 *  Liste de textures passée en parametre.
 * Permet d'obtenir :
 *  Texture passée en parametre.
 */
 class Fusion extends ShaderRenderer {
    
    /**
     * Construit le faiseur de rendu permettant de fusionner par addition plusieurs images (max 16).
     * @inheritdoc
     * @param {string[]} textureReadNames Les noms des textures d'entrée.
     * @param {string} textureWriteName Le nom de la texture de sortie.
     * @param {number} width  la résolution horizontale du rendu en nombre de pixel.
     * @param {number} height la résolution verticale du rendu en nombre de pixel.
     */
    constructor(shaderProgram, textureReadNames, textureWriteName, width, height) {
        super(shaderProgram);

        this.renderingMode = RenderingMode.quad;

        this.textureReadNames = textureReadNames;
        this.textureWriteName = textureWriteName;
        
        this.shaderProgram.use();

        this.shaderProgram.setUniform("uNbTextures", valType.i1);

        for (let i = 0; i < 16; i++) {
            this.shaderProgram.setUniform("inputColor"+i, valType.texture2D);
        }

        this.shaderProgram.setAllPos();

        this.framebuffer = new Framebuffer(width, height, 1);
    }

    /** @inheritdoc*/
    usePreviousResult(shaderResults) {
        this.shaderProgram.use();

        this.shaderProgram.setUniformValueByName("uNbTextures", this.textureReadNames.length);
        for (let i = 0; i < this.textureReadNames.length; i++) {
            const textureName = this.textureReadNames[i];
            this.shaderProgram.setUniformValueByName("inputColor"+i, i, shaderResults.get(textureName).getTexture())
        }
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