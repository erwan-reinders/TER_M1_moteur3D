/** GaussianBlur Classe shader permettant d'effectuer un flou gaussien.
 * @extends ShaderRenderer
 * Rendu sur : 
 *  Quad
 * Utilise :
 *  Texture passée en parametre.
 * Permet d'obtenir :
 *  Texture passée en parametre.
 */
class GaussianBlur extends ShaderRenderer {
    
    /**
     * Construit le faiseur de rendu permettant d'effectuer le traitement de correction gamma.
     * @inheritdoc
     * @param {number} nbPasses Le nombre de passes.
     * @param {string} textureReadName Le nom de la texture d'entrée.
     * @param {string} textureWriteName Le nom de la texture de sortie.
     * @param {number} width  la résolution horizontale du rendu en nombre de pixel.
     * @param {number} height la résolution verticale du rendu en nombre de pixel.
     */
    constructor(shaderProgram, nbPasses, textureReadName, textureWriteName, width, height) {
        super(shaderProgram);

        this.renderingMode = RenderingMode.quad;

        this.nbPasses = nbPasses;
        this.textureReadName = textureReadName;
        this.textureWriteName = textureWriteName;

        this.weight = [0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216];
        
        this.shaderProgram.use();

        this.shaderProgram.setUniform("inputColor", valType.texture2D);
        this.shaderProgram.setUniform("horizontal", valType.i1);
        for (let i = 0; i < 5; i++) {
            this.shaderProgram.setUniform("weight["+i+"]", valType.f1);
        }

        this.shaderProgram.setAllPos();

        this.pingPongFramebuffers = [new Framebuffer(width, height, 1, false), new Framebuffer(width, height, 1, false)];
        this.pingPongFramebuffers[0].init(gl.LINEAR, gl.CLAMP_TO_EDGE);
        this.pingPongFramebuffers[1].init(gl.LINEAR, gl.CLAMP_TO_EDGE);

        this.colorBuffer = undefined;
    }

    /** @inheritdoc*/
    usePreviousResult(shaderResults) {
        this.shaderProgram.use();

        //this.shaderProgram.setUniformValueByName("inputColor", 0, shaderResults.get(this.textureReadName).getTexture());
        this.colorBuffer = shaderResults.get(this.textureReadName).getTexture();
    }

    /** @inheritdoc*/
    getRenderResults() {
        let renderResults = new Array();
        renderResults.push(new ShaderRendererResult(this.textureWriteName, this.pingPongFramebuffers[(parseInt(this.nbPasses)+1)%2].textures[0], this));
        return renderResults;
    }

    /** @inheritdoc*/
    initFromScene(scene) {
        Framebuffer.clear();

        this.camera = scene.camera;
        
        this.pingPongFramebuffers[0].use();
        this.pingPongFramebuffers[0].clearColorAndDepth();
        this.pingPongFramebuffers[1].use();
        this.pingPongFramebuffers[1].clearColorAndDepth();

        this.shaderProgram.use();

        for (let i = 0; i < 5; i++) {
            this.shaderProgram.setUniformValueByName("weight["+i+"]", this.weight[i]);
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

    /**
     * Fait le rendu de la scene.
     * @param {Scene} scene La scene utilisé pour le rendu.
     * @returns {ShaderRendererResult[]} La liste des résultats de rendu.
     */
    render(scene) {
        this.initFromScene(scene);
        gl.disable(gl.DEPTH_TEST);
        let horizontal = true;
        let firstIteration = true;
        for (let i = 0; i < this.nbPasses; i++) {
            const idPingPong = ((!horizontal)+0);
            const idOtherPingPong = (horizontal+0);
            
            this.pingPongFramebuffers[idPingPong].use();

            this.shaderProgram.setUniformValueByName("horizontal", horizontal);
            const texture = firstIteration ? this.colorBuffer : this.pingPongFramebuffers[idOtherPingPong].textures[0];
            this.shaderProgram.setUniformValueByName("inputColor", 0, texture);

            this.renderingMode(scene);

            horizontal = !horizontal;

            if (firstIteration)
                firstIteration = false;
        }
        gl.enable(gl.DEPTH_TEST);

        return this.getRenderResults();
    }
}