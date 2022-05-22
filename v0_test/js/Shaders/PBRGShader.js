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
 *  {RGB}  {ScreenSpace} NormalFromMap          : les normales combinées avec les textures de normales
 *  {RGB}  {ScreenSpace} MetalRougAO            : les coefficients de metal/rugosite/AO
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

        //console.log("NEW PBR G BUFFER !!!!!");
        //console.log(shaderProgram);
        //console.log(width);
        //console.log(height);
        //console.log("========================");


        this.ShaderAlbedoCoef       = vec3.clone([1,1,1]);
        this.ShaderMetalCoef        = 1;
        this.ShaderRoughnessCoef    = 1;
        this.ShaderAOCoef           = 1;

        this.shaderProgram.setUniform("albedoMap",      valType.texture2D);
        this.shaderProgram.setUniform("normalMap",      valType.texture2D);
        this.shaderProgram.setUniform("metallicMap",    valType.texture2D);
        this.shaderProgram.setUniform("roughnessMap",   valType.texture2D);
        this.shaderProgram.setUniform("aoMap",          valType.texture2D);

        this.shaderProgram.setUniform("uAlbedoCoef",      valType.f3v);
        this.shaderProgram.setUniform("uMetallicCoef",    valType.f1);
        this.shaderProgram.setUniform("uRoughnessCoef",   valType.f1);
        this.shaderProgram.setUniform("uAOCoef",          valType.f1);

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
        //console.log("USE PREVIOUS GBUFFER PBR");
        // On n'utilise pas de précédent résultat.
        this.framebuffer.use();
        this.framebuffer.clearColorAndDepth();
    }

    /** @inheritdoc*/
    getRenderResults() {
        //console.log("GET RENDER RES GBUFFER PBR");
        let renderResults = new Array();
        renderResults.push(new ShaderRendererResult("Position"      , this.framebuffer.textures[0], this));
        renderResults.push(new ShaderRendererResult("Normal"        , this.framebuffer.textures[1], this));
        renderResults.push(new ShaderRendererResult("Albedo"        , this.framebuffer.textures[2], this));
        renderResults.push(new ShaderRendererResult("NormalFromMap" , this.framebuffer.textures[3], this));
        renderResults.push(new ShaderRendererResult("MetalRougAO"   , this.framebuffer.textures[4], this));
        return renderResults;
    }

    /** @inheritdoc*/
    initFromScene(scene) {
        //console.log("INIT FROM SCENE GBUFFER PBR");
        this.camera = scene.camera;
        this.framebuffer.use();
        this.shaderProgram.use();
        this.shaderProgram.setUniformValueByName("uProjectionMatrix", this.camera.getProjectionMatrix());
        this.shaderProgram.setUniformValueByName("uViewMatrix",       this.camera.getViewMatrix());
    }

    /** @inheritdoc*/
    setModelData(model) {
        //console.log("PBR G SHADER SET MODEL DATA");
        //console.log(model);
        //console.log(model.material);
        //console.log("===============");
        //console.log(this.ShaderMetalCoef);
        //console.log(this.ShaderRoughnessCoef);
        //console.log(this.ShaderAOCoef);
        //console.log(this.ShaderAlbedoCoef);
        //console.log("===============");


        this.shaderProgram.setUniformValueByName("uModelMatrix",  model.matrix.modelMatrix);
        this.shaderProgram.setUniformValueByName("uNormalMatrix", model.matrix.normalMatrix);

        this.shaderProgram.setUniformValueByName("albedoMap",    0, model.material.albedoMap);
        this.shaderProgram.setUniformValueByName("normalMap",    1, model.material.normalMap);
        this.shaderProgram.setUniformValueByName("metallicMap",  2, model.material.metallicMap);
        this.shaderProgram.setUniformValueByName("roughnessMap", 3, model.material.roughnessMap);
        this.shaderProgram.setUniformValueByName("aoMap",        4, model.material.aoMap);

        this.shaderProgram.setUniformValueByName("uAlbedoCoef"      , (model.material.renderWithObjCoef)? model.material.coefAlbedo : this.ShaderAlbedoCoef);
        this.shaderProgram.setUniformValueByName("uMetallicCoef"    , (model.material.renderWithObjCoef)? model.material.coefMetal : this.ShaderMetalCoef);
        this.shaderProgram.setUniformValueByName("uRoughnessCoef"   , (model.material.renderWithObjCoef)? model.material.coefRough : this.ShaderRoughnessCoef);
        this.shaderProgram.setUniformValueByName("uAOCoef"          , (model.material.renderWithObjCoef)? model.material.coefAO : this.ShaderAOCoef);
    }

    /** @inheritdoc*/
    shouldRenderOnModel(model) {
        //console.log("RENDER ON ?");
        //console.log(model);
        //console.log(model.invisible != true && model.material != undefined);

        return model.invisible != true && model.material != undefined;
    }
}