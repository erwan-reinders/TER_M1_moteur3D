/** SSAO Classe shader permettant de générer une occlusion ambiante à partir des informations géométriques espace écran.
 * @extends ShaderRenderer
 * Rendu sur : 
 *  Quad
 * Utilise :
 *  {RGB}  {ScreenSpace} Position      : les coordonées mondes
 *  {RGB}  {ScreenSpace} Normal        : les normales
 * Permet d'obtenir :
 *  {R}    {ScreenSpace} SSAO : les valeurs d'occusion.
 */
class SSAO extends ShaderRenderer {
    
    /**
     * Construit le faiseur de rendu permettant de calculer les valeurs d'occlusion.
     * @inheritdoc
     * @param {number} kernelSize  La taille du kernel.
     * @param {number} noiseTextureWidth  La largeur de la texture de bruit.
     * @param {number} noiseTextureHeight La hauteur de la texture de bruit.
     * @param {number} width         La résolution horizontale du rendu en nombre de pixel.
     * @param {number} height        La résolution verticale du rendu en nombre de pixel.
     */
    constructor(shaderProgram, kernelSize, noiseTextureWidth, noiseTextureHeight, width, height) {
        super(shaderProgram);

        this.renderingMode = RenderingMode.quad;

        this.kernelSize = kernelSize;
        this.noiseTextureWidth = noiseTextureWidth;
        this.noiseTextureHeight = noiseTextureHeight;
        this.maxKernelSize = 128;
        this.radius = 0.5;
        this.depthBias = 0.15;
        this.angleBias = 0.15;
        this.noiseScale = .25;
        this.occlusionPower = 1.5;
        // Generate kernel
        this.ssaoKernel = new Array();
        for (let i = 0; i < this.maxKernelSize; i++) {
            let sample = vec3.clone([Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0, Math.random()]);
            vec3.normalize(sample, sample);
            let r = Math.random();
            vec3.multiply(sample, sample, [r, r, r]);

            this.ssaoKernel.push(sample);
        }
        // Generate noise texture
        let noiseTextureSize = 4 * this.noiseTextureWidth * this.noiseTextureHeight;
        let ssaoNoise = new Float32Array(noiseTextureSize);
        for (let i = 0; i < noiseTextureSize; i+=4) {
            ssaoNoise[i]   = Math.random() * 2.0 - 1.0;
            ssaoNoise[i+1] = Math.random() * 2.0 - 1.0;
            ssaoNoise[i+2] = 0.0;
            ssaoNoise[i+3] = 1.0;
        }
        this.noiseTexture = getTextureFromFloats(ssaoNoise, noiseTextureWidth, noiseTextureHeight);


        
        this.shaderProgram.use();

        this.shaderProgram.setUniform("gPosition", valType.texture2D);
        this.shaderProgram.setUniform("gNormal",   valType.texture2D);
        this.shaderProgram.setUniform("texNoise",  valType.texture2D);

        for (let i = 0; i < this.maxKernelSize; i++) {
            this.shaderProgram.setUniform("samples["+i+"]", valType.f3v);
        }
        this.shaderProgram.setUniform("kernelSize", valType.i1);

        this.shaderProgram.setUniform("radius",         valType.f1);
        this.shaderProgram.setUniform("depthBias",      valType.f1);
        this.shaderProgram.setUniform("angleBias",      valType.f1);
        this.shaderProgram.setUniform("uNoiseScale",    valType.f1);
        this.shaderProgram.setUniform("occlusionPower", valType.f1);

        this.shaderProgram.setUniform("uUsedViewMatrix",       valType.Mat4fv);
        this.shaderProgram.setUniform("uUsedProjectionMatrix", valType.Mat4fv);

        this.shaderProgram.setAllPos();

        this.framebuffer = new Framebuffer(width, height, 1);
        //this.framebuffer.init(gl.LINEAR);
    }

    /** @inheritdoc*/
    usePreviousResult(shaderResults) {
        this.shaderProgram.use();

        let positionMapResult = shaderResults.get("Position");
        this.shaderProgram.setUniformValueByName("gPosition", 0,          positionMapResult.getTexture());
        this.shaderProgram.setUniformValueByName("uUsedViewMatrix",       positionMapResult.getCamera().getViewMatrix());
        this.shaderProgram.setUniformValueByName("uUsedProjectionMatrix", positionMapResult.getCamera().getProjectionMatrix());

        this.shaderProgram.setUniformValueByName("gNormal",   1, shaderResults.get("Normal").getTexture());
    }

    /** @inheritdoc*/
    getRenderResults() {
        let renderResults = new Array();
        renderResults.push(new ShaderRendererResult("SSAO", this.framebuffer.textures[0], this));
        return renderResults;
    }

    /** @inheritdoc*/
    initFromScene(scene) {
        Framebuffer.clear();

        this.camera = scene.camera;
        
        this.framebuffer.use();
        this.framebuffer.clearColorAndDepth();

        this.shaderProgram.use();

        this.shaderProgram.setUniformValueByName("texNoise", 2, this.noiseTexture);
        for (let i = 0; i < this.kernelSize; i++) {
            this.shaderProgram.setUniformValueByName("samples["+i+"]", this.ssaoKernel[i]);
        }
        this.shaderProgram.setUniformValueByName("kernelSize",     this.kernelSize);
        this.shaderProgram.setUniformValueByName("radius",         this.radius);
        this.shaderProgram.setUniformValueByName("depthBias",      this.depthBias);
        this.shaderProgram.setUniformValueByName("angleBias",      this.angleBias);
        this.shaderProgram.setUniformValueByName("uNoiseScale",    this.noiseScale);
        this.shaderProgram.setUniformValueByName("occlusionPower", this.occlusionPower);
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