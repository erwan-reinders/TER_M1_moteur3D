/** TextureGBuffer Classe modélisant la passe géométrique
 * @extends ShaderRenderer
 * Rendu sur : 
 *  Scene
 * Utilise :
 *  Rien
 * Permet d'obtenir :
 *  {RGB}  {ScreenSpace} Position      : les coordonées mondes
 *  {RGB}  {ScreenSpace} Normal        : les normales
 *  {RGBA} {ScreenSpace} ColorSpecular : la couleur et la valeur spéculaire
 */
class TextureGBuffer extends ShaderRenderer {
    /** 
     * Construit le faiseur de rendu permettant de générer des informations géométriques
     * @inheritdoc
     * @param {number} width  la résolution horizontale du rendu en nombre de pixel.
     * @param {number} height la résolution verticale du rendu en nombre de pixel.
     */
    constructor(shaderProgram, width, height) {
        super(shaderProgram);

        this.renderingMode = RenderingMode.scene;

        this.shaderProgram.setUniform("uModelMatrix",      valType.Mat4fv);
        this.shaderProgram.setUniform("uViewMatrix",       valType.Mat4fv);
        this.shaderProgram.setUniform("uProjectionMatrix", valType.Mat4fv);
        this.shaderProgram.setUniform("uNormalMatrix",     valType.Mat4fv);

        this.shaderProgram.setUniform("uDiffuseTexture",  valType.texture2D);
        this.shaderProgram.setUniform("uSpecularTexture", valType.texture2D);
        this.shaderProgram.setUniform("uDiffuseFactor",   valType.f3v);
        this.shaderProgram.setUniform("uSpecularFactor",  valType.f1);

        this.shaderProgram.setAllPos();

        this.framebuffer = new Framebuffer(width, height, 3);
    }

    /** @inheritdoc*/
    usePreviousResult(shaderResults) {
        // On n'utilise pas de précédent résultat.
    }

    /** @inheritdoc*/
    getRenderResults() {
        let renderResults = new Array();
        renderResults.push(new ShaderRendererResult("Position"     , this.framebuffer.textures[0], this));
        renderResults.push(new ShaderRendererResult("Normal"       , this.framebuffer.textures[1], this));
        renderResults.push(new ShaderRendererResult("ColorSpecular", this.framebuffer.textures[2], this));
        return renderResults;
    }

    /** @inheritdoc*/
    initFromScene(scene) {
        this.camera = scene.camera;
        
        this.framebuffer.use();
        this.framebuffer.clearColorAndDepth();

        this.shaderProgram.use();

        this.shaderProgram.setUniformValueByName("uProjectionMatrix", this.camera.getProjectionMatrix());
        this.shaderProgram.setUniformValueByName("uViewMatrix",       this.camera.getViewMatrix());
    }

    /** @inheritdoc*/
    setModelData(model) {
        this.shaderProgram.setUniformValueByName("uModelMatrix",  model.matrix.modelMatrix);
        this.shaderProgram.setUniformValueByName("uNormalMatrix", model.matrix.normalMatrix);

        this.shaderProgram.setUniformValueByName("uDiffuseTexture", 0, model.diffuseTexture);
        this.shaderProgram.setUniformValueByName("uSpecularTexture", 1, model.specularTexture);

        let diffuseFactor  = (model.diffuseFactor)  ? model.diffuseFactor  : vec3.clone([1.0, 1.0, 1.0]);
        let specularFactor = (model.specularFactor) ? model.specularFactor : 1.0;
        this.shaderProgram.setUniformValueByName("uDiffuseFactor",  diffuseFactor);
        this.shaderProgram.setUniformValueByName("uSpecularFactor", specularFactor);
    }

    /** @inheritdoc*/
    shouldRenderOnModel(model) {
        return model.invisible != true;
    }
}