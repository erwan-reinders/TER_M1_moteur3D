/** BlinnPhong Classe shader permettant de générer un éclairage par Blinn phong
 * @extends ShaderRenderer
 * Rendu sur : 
 *  Quad
 * Utilise :
 *  {RGB}  {ScreenSpace} Position      : les coordonées mondes
 *  {RGB}  {ScreenSpace} Normal        : les normales
 *  {RGBA} {ScreenSpace} ColorSpecular : la couleur et la valeur spéculaire
 * Permet d'obtenir :
 *  {RGB}  {ScreenSpace} BlinnPhong    : la couleur BlinnPhong.
 */
class BlinnPhong extends ShaderRenderer {
    
    /**
     * Construit le faiseur de rendu permettant de dessiner un éclairage BlinnPhong.
     * @inheritdoc
     * @param {number} width  la résolution horizontale du rendu en nombre de pixel.
     * @param {number} height la résolution verticale du rendu en nombre de pixel.
     */
    constructor(shaderProgram, width, height) {
        super(shaderProgram);

        this.nLights = 0;
        this.ambiant = 0.1;
        
        this.shaderProgram.use();

        this.shaderProgram.setUniform("gPosition",   valType.i1);
        this.shaderProgram.setUniform("gNormal",     valType.i1);
        this.shaderProgram.setUniform("gAlbedoSpec", valType.i1);

        this.shaderProgram.setUniform("uNLights",    valType.i1);
        this.shaderProgram.setUniform("uViewPos",    valType.f3v);
        this.shaderProgram.setUniform("uAmbiant",    valType.f1);

        this.nLightsInShader = 16;
        for (let i = 0; i < this.nLightsInShader; i++) {
            this.shaderProgram.setUniform("uLights["+i+"].Position"  , valType.f3v);
            this.shaderProgram.setUniform("uLights["+i+"].Color"     , valType.f3v);
            this.shaderProgram.setUniform("uLights["+i+"].Linear"    , valType.f1);
            this.shaderProgram.setUniform("uLights["+i+"].Quadratic" , valType.f1);
        }

        this.shaderProgram.setAllPos();

        this.framebuffer = new Framebuffer(width, height, 1);
    }

    /** @inheritdoc*/
    usePreviousResult(shaderResults) {
        this.shaderProgram.use();

        this.shaderProgram.setUniformValueByName("gPosition", 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, shaderResults.get("Position").getTexture());

        this.shaderProgram.setUniformValueByName("gNormal", 1);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, shaderResults.get("Normal").getTexture());

        this.shaderProgram.setUniformValueByName("gAlbedoSpec", 2);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, shaderResults.get("ColorSpecular").getTexture());
    }

    /** @inheritdoc*/
    getRenderResults() {
        let renderResults = new Array();
        renderResults.push(new ShaderRendererResult("BlinnPhong" , this.framebuffer.textures[0], this.camera));
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
        
        this.shaderProgram.setUniformValueByName("uNLights", this.nLights);
        this.shaderProgram.setUniformValueByName("uAmbiant", this.ambiant);

        for (let i = 0; i < this.nLights; i++) {
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
    shouldRenderScene(scene) {
        return false;
    }

    /** @inheritdoc*/
    shouldRenderOnModel(model) {
        return false;
    }
}