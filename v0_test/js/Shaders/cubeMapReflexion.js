/** CubeMapReflexion Classe shader permettant d'afficher une reflexion sur des objets à partir d'une cubemap.
 * @extends ShaderRenderer
 * Rendu sur : 
 *  Quad
 * Utilise :
 *  {RGB}  {ScreenSpace} ReflexionPosition : les coordonées mondes des objets ayant la reflexion.
 *  {RGB}  {ScreenSpace} ReflexionNormal   : les normales des objets ayant la reflexion.
 * Permet d'obtenir :
 *  {RGB}  {ScreenSpace} Reflexion     : la couleur obtenue par reflexion.
 */
class CubeMapReflexion extends ShaderRenderer {
    
    /**
     * Construit le faiseur de rendu permettant d'afficher une cubemap sur un objet.
     * @inheritdoc
     * @param {Cubemap} cubemap La cubemap de reflexion à afficher.
     * @param {number} width  la résolution horizontale du rendu en nombre de pixel.
     * @param {number} height la résolution verticale du rendu en nombre de pixel.
     */
    constructor(shaderProgram, cubemap, width, height) {
        super(shaderProgram);

        this.renderingMode = RenderingMode.quad;

        this.cubemap = cubemap;
        
        this.shaderProgram.use();

        this.shaderProgram.setUniform("gPosition",   valType.texture2D);
        this.shaderProgram.setUniform("gNormal",     valType.texture2D);

        this.shaderProgram.setUniform("skybox",      valType.textureCubeMap);

        this.shaderProgram.setUniform("uViewPos",    valType.f3v);

        this.shaderProgram.setAllPos();

        this.framebuffer = new Framebuffer(width, height, 1);
    }

    /** @inheritdoc*/
    usePreviousResult(shaderResults) {
        this.shaderProgram.use();

        this.shaderProgram.setUniformValueByName("gPosition", 0, shaderResults.get("ReflexionPosition").getTexture());
        this.shaderProgram.setUniformValueByName("gNormal",   1, shaderResults.get("ReflexionNormal").getTexture());
    }

    /** @inheritdoc*/
    getRenderResults() {
        let renderResults = new Array();
        renderResults.push(new ShaderRendererResult("Reflexion" , this.framebuffer.textures[0], this));
        return renderResults;
    }

    /** @inheritdoc*/
    initFromScene(scene) {
        Framebuffer.clear();

        this.camera = scene.camera;
        
        this.framebuffer.use();
        this.framebuffer.clearColorAndDepth();

        this.shaderProgram.use();

        this.shaderProgram.setUniformValueByName("uViewPos", this.camera.position);
        if (this.cubemap.ready) {
            this.shaderProgram.setUniformValueByName("skybox", 2, this.cubemap.texture);
        }
        else {
            this.shaderProgram.setUniformValueByName("skybox", 2, loadingCubemap.texture);
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