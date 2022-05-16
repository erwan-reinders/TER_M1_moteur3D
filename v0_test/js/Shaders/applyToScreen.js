/** ApplyToScreen Classe shader permettant d'appliquer une texture sur l'ecran
 * @extends ShaderRenderer
 * Rendu sur : 
 *  Quad
 * Utilise :
 *  Texture passé en parametre, par defaut :
 *     {RGB} {ScreenSpace} Position 
 * Permet d'obtenir :
 *  Rien
 */
class ApplyToScreen extends ShaderRenderer {
    
    /**
     * Construit le faiseur de rendu permettant de dessiner une texture sur une zone de l'ecran.
     * @inheritdoc
     * @param {string} textureToApplyName Le nom de la texture que lon sougaute redessiner sur l'ecran.
     * @param {GLint} x La coordonée horizontale du coin supérieur gauche.
     * @param {GLint} y La coordonée verticale du coin supérieur gauche.
     * @param {GLsizei} width La largeur de l'image.
     * @param {GLsizei} height La hauteur de l'image.
     */
    constructor(shaderProgram, textureToApplyName = "Position", x = 0, y = 0, width = canvas.width, height = canvas.height) {
        super(shaderProgram);

        this.renderingMode = RenderingMode.quad;

        this.textureToApplyName = textureToApplyName;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        this.shaderProgram.setUniform("inputColor", valType.texture2D);

        this.shaderProgram.setAllPos();
    }

    /** @inheritdoc*/
    usePreviousResult(shaderResults) {
        this.shaderProgram.use();

        this.shaderProgram.setUniformValueByName("inputColor", 0, shaderResults.get(this.textureToApplyName).getTexture());
    }

    /** @inheritdoc*/
    getRenderResults() {
        return new Array();
    }

    /** @inheritdoc*/
    initFromScene(scene) {
        Framebuffer.clear();
        this.shaderProgram.use();
        gl.viewport(this.x, this.y, this.width, this.height);
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