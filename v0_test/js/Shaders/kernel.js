/** Kernel Classe shader permettant de générer l'image résultante à la convolution entre l'image d'origine et le kernel passé en paramettre.
 * @extends ShaderRenderer
 * Rendu sur : 
 *  Quad
 * Utilise :
 *  Texture passée en parametre.
 * Permet d'obtenir :
 *  Texture passée en parametre.
 */
class Kernel extends ShaderRenderer {
    
    /**
     * Construit le faiseur de rendu permettant de dessiner un éclairage BlinnPhong.
     * @inheritdoc
     * @param {Float32Array} kernel Le noyau de convolution. La taille doit correspondre à celle du shader utilisé.
     * @param {string} textureReadName Le nom de la texture d'entrée.
     * @param {string} textureWriteName Le nom de la texture de sortie.
     * @param {number} width  la résolution horizontale du rendu en nombre de pixel.
     * @param {number} height la résolution verticale du rendu en nombre de pixel.
     */
    constructor(shaderProgram, kernel, textureReadName, textureWriteName, width, height) {
        super(shaderProgram);

        this.renderingMode = RenderingMode.quad;

        this.kernel = kernel;
        this.textureReadName = textureReadName;
        this.textureWriteName = textureWriteName;
        
        this.shaderProgram.use();

        this.shaderProgram.setUniform("inputColor", valType.texture2D);
        for (let i = 0; i < kernel.length; i++) {
            this.shaderProgram.setUniform("uKernel["+i+"]", valType.f1);
        }

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

        for (let i = 0; i < this.kernel.length; i++) {
            const k = this.kernel[i];
            this.shaderProgram.setUniformValueByName("uKernel["+i+"]", k);
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