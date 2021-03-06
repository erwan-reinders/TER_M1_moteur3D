/** PBR Shader permettant de générer un éclairage par Calcul physique de la lumière.
 * @extends ShaderRenderer
 * Rendu sur :
 *  Quad
 * Utilise :
 *  {RGB}  {ScreenSpace} Position               : les coordonées mondes
 *  {RGB}  {ScreenSpace} Normal                 : les normales
 *  {RGB}  {ScreenSpace} Albedo                 : la couleur albedo
 *  {RGB}  {ScreenSpace} NormalFromMap          : les normales combinées avec les textures de normales
 *  {RGB}  {ScreenSpace} MetalRougAO            : les coefficients de metal/rugosite/AO
 Permet d'obtenir :
 *  {RGB}  {ScreenSpace} PBR    : la couleur PBR.
 */
class PBRShader extends ShaderRenderer {

    /**
     * Construit le faiseur de rendu permettant de dessiner un éclairage PBR.
     * @inheritdoc
     * @param {ShaderRenderer} shadowRenderer Le renderer permettant d'obtenir les cartes d'ombres.
     * @param {number}  width  La résolution horizontale du rendu en nombre de pixel.
     * @param {number}  height La résolution verticale du rendu en nombre de pixel.
     * */
    constructor(shaderProgram, width, height) {
        super(shaderProgram);
        this.renderingMode = RenderingMode.quad;

        this.shaderProgram.use();
        this.shaderProgram.setUniform("gPosition",           valType.texture2D);
        this.shaderProgram.setUniform("gNormal",             valType.texture2D);
        this.shaderProgram.setUniform("gAlbedoMap",          valType.texture2D);
        this.shaderProgram.setUniform("gNormalFromMap",      valType.texture2D);
        this.shaderProgram.setUniform("gMettalicRoughnesAO", valType.texture2D);

        this.shaderProgram.setUniform("uNLights",    valType.i1);
        this.shaderProgram.setUniform("uViewPos",    valType.f3v);

        this.nLightsInShader = 16;
        for (let i = 0; i < this.nLightsInShader; i++) {
            this.shaderProgram.setUniform("uLights["+i+"].Position"  , valType.f3v);
            this.shaderProgram.setUniform("uLights["+i+"].Color"     , valType.f3v);
            this.shaderProgram.setUniform("uLights["+i+"].Linear"    , valType.f1);
            this.shaderProgram.setUniform("uLights["+i+"].Quadratic" , valType.f1);
        }
        this.shaderProgram.setAllPos();

        this.framebuffer = new Framebuffer(width, height, 2);
    }

    /** @inheritdoc*/
    usePreviousResult(shaderResults) {
        this.shaderProgram.use();
        this.shaderProgram.setUniformValueByName("gPosition",           0, shaderResults.get("Position").getTexture());
        this.shaderProgram.setUniformValueByName("gNormal",             1, shaderResults.get("Normal").getTexture());
        this.shaderProgram.setUniformValueByName("gAlbedoMap",          2, shaderResults.get("Albedo").getTexture());
        this.shaderProgram.setUniformValueByName("gNormalFromMap",      3, shaderResults.get("NormalFromMap").getTexture());
        this.shaderProgram.setUniformValueByName("gMettalicRoughnesAO", 4, shaderResults.get("MetalRougAO").getTexture());
    }

    /** @inheritdoc*/
    getRenderResults() {
        let renderResults = new Array();
        renderResults.push(new ShaderRendererResult("PBR" , this.framebuffer.textures[0], this));
        renderResults.push(new ShaderRendererResult("PBRRadianceSum" , this.framebuffer.textures[1], this));
        return renderResults;
    }

    /** @inheritdoc*/
    initFromScene(scene) {
        Framebuffer.clear();
        this.camera = scene.camera;

        this.framebuffer.use();
        this.framebuffer.clearColorAndDepth();

        this.shaderProgram.use();
        this.shaderProgram.setUniformValueByName("uViewPos", scene.camera.position);

        if (scene.lights.length != this.nLights) {
            if (this.lights > scene.lights.length) {
                for (let i = scene.lights.length; i < this.lights; i++) {
                    this.shaderProgram.setUniformValueByName("uLights["+i+"].Position"  , vec3.clone([0.0, 0.0, 0.0]));
                    this.shaderProgram.setUniformValueByName("uLights["+i+"].Color"     , vec3.clone([0.0, 0.0, 0.0]));
                    this.shaderProgram.setUniformValueByName("uLights["+i+"].Linear"    , 1.0);
                    this.shaderProgram.setUniformValueByName("uLights["+i+"].Quadratic" , 1.0);
                }
            }
            this.nLights = Math.min(this.nLightsInShader, scene.lights.length);
        }
        //console.log(this.nLights);
        this.shaderProgram.setUniformValueByName("uNLights", this.nLights);
        for (let i = 0; i < this.nLights; i++) {
            //console.log(scene.lights[i].position);
            //console.log(scene.lights[i].color);

            this.shaderProgram.setUniformValueByName("uLights["+i+"].Position"  , scene.lights[i].position);
            this.shaderProgram.setUniformValueByName("uLights["+i+"].Color"     , scene.lights[i].color);
            this.shaderProgram.setUniformValueByName("uLights["+i+"].Linear"    , scene.lights[i].linear);
            this.shaderProgram.setUniformValueByName("uLights["+i+"].Quadratic" , scene.lights[i].quadratic);
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