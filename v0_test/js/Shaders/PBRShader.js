/** PBR Shader permettant de générer un éclairage par Calcul ohysique de la lumière.
 * @extends ShaderRenderer
 * Rendu sur :
 *  Quad
 * Utilise :
 *  {RGB}  {ScreenSpace} Position      : les coordonées mondes
 *  {RGB}  {ScreenSpace} Normal        : les normales
 *  {RGBA} {ScreenSpace} ColorSpecular : la couleur et la valeur spéculaire
 *  {RGBA} {Texture} AlbedoMap              : la carte de couleur de l'objet (par défaut)
 *  {RGBA} {Texture} NormalMap              : la carte de déplacement des normales de l'objet
 *  {RGBA} {Texture} MettalicMap            : la carte de coefficient métalique de l'objet
 *  {RGBA} {Texture} RoughnessMap           : la carte de rugodsité
 *  {RGBA} {Texture} aoMap                  : l'occlusion ambiante
 * Permet d'obtenir :
 *  {RGB}  {ScreenSpace} PBR    : la couleur PBR.
 */
class PBRShader extends ShaderRenderer {

    /**
     * Construit le faiseur de rendu permettant de dessiner un éclairage PBR.
     * @inheritdoc
     * @param {ShaderRenderer} shadowRenderer Le renderer permettant d'obtenir les cartes d'ombres.
     * @param {number}  width  La résolution horizontale du rendu en nombre de pixel.
     * @param {number}  height La résolution verticale du rendu en nombre de pixel.
     * @param {WebGLTexture}  albedoMap Texture d'albedo
     * @param {WebGLTexture}  normalMap Texture de normales
     * @param {WebGLTexture}  metallicMap Texture de coefficient métalique
     * @param {WebGLTexture}  roughnessMap Texture de rugosité
     * @param {WebGLTexture}  aoMap Texture d'ambient occlusion
     *
     */
    constructor(shaderProgram, shadowRenderer, width, height, albedoMap,normalMap,metallicMap,roughnessMap,aoMap) {
        super(shaderProgram);
        this.renderingMode = RenderingMode.quad;

        this.shadowRenderer = shadowRenderer;

        this.albedoMap      = albedoMap;
        this.normalMap      = normalMap;
        this.metallicMap    = metallicMap;
        this.roughnessMap   = roughnessMap;
        this.aoMap          = aoMap;

        this.shaderProgram.use();
        this.shaderProgram.setUniform("gPosition",      valType.texture2D);
        this.shaderProgram.setUniform("gNormal",        valType.texture2D);
        this.shaderProgram.setUniform("gAlbedoSpec",    valType.texture2D);

        this.shaderProgram.setUniform("albedoMap",      valType.texture2D);
        this.shaderProgram.setUniform("normalMap",      valType.texture2D);
        this.shaderProgram.setUniform("metallicMap",    valType.texture2D);
        this.shaderProgram.setUniform("roughnessMap",   valType.texture2D);
        this.shaderProgram.setUniform("aoMap",          valType.texture2D);

        this.shaderProgram.setUniform("uNLights",    valType.i1);
        this.shaderProgram.setUniform("uViewPos",    valType.f3v);

        this.nLightsInShader = 16;
        for (let i = 0; i < this.nLightsInShader; i++) {
            this.shaderProgram.setUniform("uLights["+i+"].Position"  , valType.f3v);
            this.shaderProgram.setUniform("uLights["+i+"].Color"     , valType.f3v);
        }
        this.shaderProgram.setAllPos();
        this.framebuffer = new Framebuffer(width, height, 1);
    }

    /** @inheritdoc*/
    usePreviousResult(shaderResults) {
        this.shaderProgram.use();
        this.shaderProgram.setUniformValueByName("gPosition",   0, shaderResults.get("Position").getTexture());
        this.shaderProgram.setUniformValueByName("gNormal",     1, shaderResults.get("Normal").getTexture());
        this.shaderProgram.setUniformValueByName("gAlbedoSpec", 2, shaderResults.get("ColorSpecular").getTexture());
    }

    /** @inheritdoc*/
    getRenderResults() {
        let renderResults = new Array();
        renderResults.push(new ShaderRendererResult("PBR" , this.framebuffer.textures[0], this));
        return renderResults;
    }

    /** @inheritdoc*/
    initFromScene(scene) {
        Framebuffer.clear();

        this.camera = scene.camera;

        this.pingpongFramebuffers[0].use();
        this.pingpongFramebuffers[0].clearColorAndDepth();
        this.pingpongFramebuffers[1].use();
        this.pingpongFramebuffers[1].clearColorAndDepth();

        this.shaderProgram.use();

        this.idReturnFbo = (scene.lights.length + 1) % 2;
    }

    /** @inheritdoc*/
    setModelData(model) {
        // On ne fait pas de rendu sur les modèles
    }

    /** @inheritdoc*/
    shouldRenderOnModel(model) {
        return false;
    }


    /**
     * Fait le rendu de la scene.
     * @param {Scene} scene La scene utilisé pour le rendu.
     * @returns {ShaderRendererResult[]} La liste des résultats de rendu.
     */
    render(scene) {
        this.initFromScene(scene);

        this.shaderProgram.setUniformValueByName("gPosition",          0, this.previousResultTexturesToUse[0]);
        this.shaderProgram.setUniformValueByName("gNormal",            1, this.previousResultTexturesToUse[1]);
        this.shaderProgram.setUniformValueByName("gAlbedoSpec",        2, this.previousResultTexturesToUse[2]);

        this.shaderProgram.setUniformValueByName("albedoMap",        3, this.albedoMap);
        this.shaderProgram.setUniformValueByName("normalMap",        4, this.normalMap);
        this.shaderProgram.setUniformValueByName("metallicMap",      5, this.metallicMap);
        this.shaderProgram.setUniformValueByName("roughnessMap",     6, this.roughnessMap);
        this.shaderProgram.setUniformValueByName("aoMap",            7, this.aoMap);

        for (let i = 0; i < scene.lights.length; i++) {
            this.shaderProgram.setUniformValueByName("uLight.Position",   scene.lights[i].position);
            this.shaderProgram.setUniformValueByName("uLight.Color",      scene.lights[i].color);

            gl.disable(gl.DEPTH_TEST);
            this.renderingMode(scene);
            gl.enable(gl.DEPTH_TEST);
        }
        return this.getRenderResults();
    }
}