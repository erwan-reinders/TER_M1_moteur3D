/** TextureGBuffer Classe modélisant la passe géométrique
 * @extends ShaderRenderer
 * Rendu sur :
 *  Scene
 * Utilise :
 *  Rien
 * Permet d'obtenir :
 *  {RGB}  {ScreenSpace} Position               : les coordonées mondes
 *  {RGB}  {ScreenSpace} Normal                 : les normales
 *  {RGB}  {ScreenSpace} Albedo                 : la couleur albedo
 *  {RGB}  {ScreenSpace} NormalMap              : les normales remappees
 *  {RGB}  {ScreenSpace} MettalicRoughnessAO    : les coefficients de metal/rugosite/AO
 */

class PBRGBuffer extends ShaderRenderer {
    /**
     * Construit le faiseur de rendu permettant de générer des informations géométriques
     * @inheritdoc
     * @param {number} width  la résolution horizontale du rendu en nombre de pixel.
     * @param {number} height la résolution verticale du rendu en nombre de pixel.
     */
    constructor(shaderProgram, width, height) {
        super(shaderProgram);

        this.shaderProgram.setUniform("albedoMap",      valType.texture2D);
        this.shaderProgram.setUniform("normalMap",      valType.texture2D);
        this.shaderProgram.setUniform("metallicMap",    valType.texture2D);
        this.shaderProgram.setUniform("roughnessMap",   valType.texture2D);
        this.shaderProgram.setUniform("aoMap",          valType.texture2D);

        this.shaderProgram.setUniform("albedoCoef",      valType.f3v);
        this.shaderProgram.setUniform("metallicCoef",    valType.f1);
        this.shaderProgram.setUniform("roughnessCoef",   valType.f1);
        this.shaderProgram.setUniform("aoCoef",          valType.f1);

        this.renderingMode = RenderingMode.scene;
        this.shaderProgram.setUniform("uModelMatrix",      valType.Mat4fv);
        this.shaderProgram.setUniform("uViewMatrix",       valType.Mat4fv);
        this.shaderProgram.setUniform("uProjectionMatrix", valType.Mat4fv);
        this.shaderProgram.setUniform("uNormalMatrix",     valType.Mat4fv);
        this.shaderProgram.setAllPos();


        this.framebuffer = new Framebuffer(width, height, 5, false);
        this.framebuffer.init(gl.NEAREST, gl.MIRRORED_REPEAT);
    }

    /** @inheritdoc*/
    usePreviousResult(shaderResults) {
        // On n'utilise pas de précédent résultat.
        this.framebuffer.use();
        this.framebuffer.clearColorAndDepth();
    }

    /** @inheritdoc*/
    getRenderResults() {
        let renderResults = new Array();
        renderResults.push(new ShaderRendererResult("Position"      , this.framebuffer.textures[0], this));
        renderResults.push(new ShaderRendererResult("Normal"        , this.framebuffer.textures[1], this));
        renderResults.push(new ShaderRendererResult("Albedo"        , this.framebuffer.textures[2], this));
        renderResults.push(new ShaderRendererResult("NormalMap"     , this.framebuffer.textures[3], this));
        renderResults.push(new ShaderRendererResult("MetalRougAO"   , this.framebuffer.textures[4], this));
        return renderResults;
    }

    /** @inheritdoc*/
    initFromScene(scene) {
        this.camera = scene.camera;
        this.framebuffer.use();
        this.shaderProgram.use();
        this.shaderProgram.setUniformValueByName("uProjectionMatrix", this.camera.getProjectionMatrix());
        this.shaderProgram.setUniformValueByName("uViewMatrix",       this.camera.getViewMatrix());
    }

    /** @inheritdoc*/
    setModelData(model) {
        this.shaderProgram.setUniformValueByName("uModelMatrix",  model.matrix.modelMatrix);
        this.shaderProgram.setUniformValueByName("uNormalMatrix", model.matrix.normalMatrix);

        this.shaderProgram.setUniformValueByName("albedoMap", 0, model.material.albedoMap);
        this.shaderProgram.setUniformValueByName("normalMap", 1, model.material.normalMap);
        this.shaderProgram.setUniformValueByName("metallicMap", 2, model.material.metallicMap);
        this.shaderProgram.setUniformValueByName("roughnessMap", 3, model.material.roughnessMap);
        this.shaderProgram.setUniformValueByName("aoMap", 4, model.material.aoMap);

        this.shaderProgram.setUniformValueByName("uAlbedoCoef"      , model.material.coefAlbedo);
        this.shaderProgram.setUniformValueByName("uMetallicCoef"    , model.material.coefMetal);
        this.shaderProgram.setUniformValueByName("uRoughnessCoef"   , model.material.coefRough);
        this.shaderProgram.setUniformValueByName("uAOCoef"          , model.material.coefAO);
    }

    /** @inheritdoc*/
    shouldRenderOnModel(model) {
        return model.invisible != true && model.material != undefined;
    }
}