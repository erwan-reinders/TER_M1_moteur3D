/**Classe modélisant le résultat d'une passe par un shader. */
class ShaderRendererResult {
    /**
     * Constructeur d'un résultat de passe shader.
     * @param {string} name Le nom du résultat. Permet d'identifier le résultat.
     * @param {WebGLTexture} resultTextureBuffer La texture résultant de la passe.
     * @param {ShaderRenderer} usedShaderRenderer Le faiseur de rendu qui à été utilisé pour faire ce rendu.
     */
    constructor(name, resultTextureBuffer, shaderRenderer) {
        this.name = name;
        this.textureBuffer = resultTextureBuffer;
        this.shaderRenderer = shaderRenderer;
    }

    /**
     * Permet d'obtenir la texture du résultat.
     * @returns {WebGLTexture} La texture du résultat.
     */
    getTexture() {
        return this.textureBuffer;
    }

    /**
     * Permet d'obtenir la caméra utilisé pour le rendu.
     * @returns {Camera} La caméra du rendu.
     */
    getCamera() {
        return this.shaderRenderer.camera;
    }

    /**
     * Permet d'obtenir le framebuffer utilisé pour le rendu.
     * @returns {Framebuffer} Le framebuffer du rendu.
     */
    getFramebuffer() {
        return this.shaderRenderer.framebuffer;
    }
}