/** GBuffer Classe modélisant la passe géométrique sur certain modèles.
 * @extends ShaderRenderer
 * Rendu sur : 
 *  Scene
 * Utilise :
 *  Rien
 * Permet d'obtenir :
 *  {RGB}  {ScreenSpace} XPosition      : les coordonées mondes
 *  {RGB}  {ScreenSpace} XNormal        : les normales
 */
class GBuffer extends ShaderRenderer {
    /** 
     * Construit le faiseur de rendu permettant de générer des informations géométriques
     * @inheritdoc
     * @param {function(Model) : boolean} conditionOnModelFunction  La résolution horizontale du rendu en nombre de pixel.
     * @param {string} namePrefix Le nom pour préfixer les résultats.
     * @param {string} textureReadDepthName Le nom de la texture auquelle on vas lire les valeurs de profondeurs.
     * @param {number} width  La résolution horizontale du rendu en nombre de pixel.
     * @param {number} height La résolution verticale du rendu en nombre de pixel.
     */
    constructor(shaderProgram, conditionOnModelFunction, namePrefix, textureReadDepthName, width, height) {
        super(shaderProgram);

        this.renderingMode = RenderingMode.scene;
        this.conditionOnModelFunction = conditionOnModelFunction;
        this.namePrefix = namePrefix;
        this.textureReadDepthName = textureReadDepthName;

        this.shaderProgram.setUniform("uModelMatrix",      valType.Mat4fv);
        this.shaderProgram.setUniform("uViewMatrix",       valType.Mat4fv);
        this.shaderProgram.setUniform("uProjectionMatrix", valType.Mat4fv);
        this.shaderProgram.setUniform("uNormalMatrix",     valType.Mat4fv);

        this.shaderProgram.setAllPos();

        this.framebuffer = new Framebuffer(width, height, 2, false);
        this.framebuffer.init(gl.NEAREST, gl.MIRRORED_REPEAT);
    }

    /** @inheritdoc*/
    usePreviousResult(shaderResults) {
        this.framebuffer.use();
        this.framebuffer.clearColorAndDepth();
        if (this.textureReadDepthName != undefined) {
            this.framebuffer.copyBitsOf(shaderResults.get(this.textureReadDepthName).getFramebuffer(), gl.DEPTH_BUFFER_BIT);
        }
    }

    /** @inheritdoc*/
    getRenderResults() {
        let renderResults = new Array();
        renderResults.push(new ShaderRendererResult(this.namePrefix+"Position", this.framebuffer.textures[0], this));
        renderResults.push(new ShaderRendererResult(this.namePrefix+"Normal"  , this.framebuffer.textures[1], this));
        return renderResults;
    }

    /** @inheritdoc*/
    initFromScene(scene) {
        this.camera = scene.camera;
        
        this.framebuffer.use();

        this.shaderProgram.use();

        this.shaderProgram.setUniformValueByName("uProjectionMatrix", this.camera.getProjectionMatrix());
        this.shaderProgram.setUniformValueByName("uViewMatrix",       this.camera.getViewMatrix());

        gl.depthFunc(gl.LEQUAL);
    }

    /** @inheritdoc*/
    setModelData(model) {
        this.shaderProgram.setUniformValueByName("uModelMatrix",  model.matrix.modelMatrix);
        this.shaderProgram.setUniformValueByName("uNormalMatrix", model.matrix.normalMatrix);
    }

    /** @inheritdoc*/
    shouldRenderOnModel(model) {
        return this.conditionOnModelFunction(model);
    }
}