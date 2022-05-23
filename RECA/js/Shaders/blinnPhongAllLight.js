/** BlinnPhongAllLight Classe shader permettant de générer un éclairage par Blinn phong avec ombrage et SSAO sur les lumières de manières séparée.
 * @extends ShaderRenderer
 * Rendu sur : 
 *  Quad
 * Utilise :
 *  {RGB}  {ScreenSpace} Position      : les coordonées mondes
 *  {RGB}  {ScreenSpace} Normal        : les normales
 *  {RGBA} {ScreenSpace} ColorSpecular : la couleur et la valeur spéculaire
 *  {RGBA} {ScreenSpace} SSAO          : l'occlusion ambiante
 * Permet d'obtenir :
 *  {RGB}  {ScreenSpace} BlinnPhong    : la couleur BlinnPhong.
 */
class BlinnPhongAllLight extends ShaderRenderer {
    
    /**
     * Construit le faiseur de rendu permettant de dessiner un éclairage BlinnPhong.
     * @inheritdoc
     * @param {ShaderRenderer} shadowRenderer Le renderer permettant d'obtenir les cartes d'ombres.
     * @param {number}  width  La résolution horizontale du rendu en nombre de pixel.
     * @param {number}  height La résolution verticale du rendu en nombre de pixel.
     */
    constructor(shaderProgram, shadowRenderer, width, height) {
        super(shaderProgram);

        this.renderingMode = RenderingMode.quad;
        
        this.shadowRenderer = shadowRenderer;
        this.ambiant = 0.3;
        
        this.shaderProgram.use();

        this.shaderProgram.setUniform("gPosition",   valType.texture2D);
        this.shaderProgram.setUniform("gNormal",     valType.texture2D);
        this.shaderProgram.setUniform("gAlbedoSpec", valType.texture2D);
        this.shaderProgram.setUniform("shadowMap",   valType.texture2D);
        this.shaderProgram.setUniform("SSAOMap",     valType.texture2D);
        this.shaderProgram.setUniform("previousBlinnPhong", valType.texture2D);

        this.shaderProgram.setUniform("uLight.Position",  valType.f3v);
        this.shaderProgram.setUniform("uLight.Color",     valType.f3v);
        this.shaderProgram.setUniform("uLight.Linear",    valType.f1);
        this.shaderProgram.setUniform("uLight.Quadratic", valType.f1);

        this.shaderProgram.setUniform("uViewPos",             valType.f3v);
        this.shaderProgram.setUniform("useAmbiantAndSSAO",    valType.i1);
        this.shaderProgram.setUniform("uAmbiant",             valType.f1);

        this.shaderProgram.setUniform("usePrevious",        valType.i1);


        this.shaderProgram.setAllPos();

        this.pingpongFramebuffers = [new Framebuffer(width, height, 1), new Framebuffer(width, height, 1)];
        this.idReturnFbo = 0;

        this.previousResultTexturesToUse = new Array(4);
    }

    /** @inheritdoc*/
    usePreviousResult(shaderResults) {
        this.shaderProgram.use();

        this.previousResultTexturesToUse[0] = shaderResults.get("Position").getTexture();
        this.previousResultTexturesToUse[1] = shaderResults.get("Normal").getTexture();
        this.previousResultTexturesToUse[2] = shaderResults.get("ColorSpecular").getTexture();
        this.previousResultTexturesToUse[3] = shaderResults.get("SSAO").getTexture();

        this.shadowRenderer.usePreviousResult(shaderResults);
    }

    /** @inheritdoc*/
    getRenderResults() {
        let renderResults = new Array();
        renderResults.push(new ShaderRendererResult("BlinnPhong" , this.pingpongFramebuffers[this.idReturnFbo].textures[0], this));
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

        for (let i = 0; i < scene.lights.length; i++) {
            const firstRender   = (i == 0);
            const idCurrentFbo  =  i % 2;
            const idPreviousFbo = (i + 1) % 2;

            this.shadowRenderer.setRenderingFrom(scene.lights[i].position);
            let results = this.shadowRenderer.render(scene);
            let texture = results.get("Shadow").getTexture();

            this.pingpongFramebuffers[idCurrentFbo].use();
            this.shaderProgram.use();


            this.shaderProgram.setUniformValueByName("gPosition",          0, this.previousResultTexturesToUse[0]);
            this.shaderProgram.setUniformValueByName("gNormal",            1, this.previousResultTexturesToUse[1]);
            this.shaderProgram.setUniformValueByName("gAlbedoSpec",        2, this.previousResultTexturesToUse[2]);
            this.shaderProgram.setUniformValueByName("shadowMap",          3, texture);
            this.shaderProgram.setUniformValueByName("SSAOMap",            4, this.previousResultTexturesToUse[3]);
            this.shaderProgram.setUniformValueByName("previousBlinnPhong", 5, this.pingpongFramebuffers[idPreviousFbo].textures[0]);

            this.shaderProgram.setUniformValueByName("useAmbiantAndSSAO",  firstRender);
            this.shaderProgram.setUniformValueByName("usePrevious",       !firstRender);

            this.shaderProgram.setUniformValueByName("uViewPos", this.camera.position);
            this.shaderProgram.setUniformValueByName("uAmbiant", this.ambiant);

            this.shaderProgram.setUniformValueByName("uLight.Position",   scene.lights[i].position);
            this.shaderProgram.setUniformValueByName("uLight.Color",      scene.lights[i].color);
            this.shaderProgram.setUniformValueByName("uLight.Linear",     scene.lights[i].linear);
            this.shaderProgram.setUniformValueByName("uLight.Quadratic" , scene.lights[i].quadratic);

            gl.disable(gl.DEPTH_TEST);
            this.renderingMode(scene);
            gl.enable(gl.DEPTH_TEST);

        }
        
        return this.getRenderResults();
    }
}