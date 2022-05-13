/**Classe modélisant le résultat d'une passe par un shader. */
class ShaderRendererResult {
    /**
     * Constructeur d'un résultat de passe shader.
     * @param {string} name Le nom du résultat. Permet d'identifier le résultat.
     * @param {WebGLTexture} resultTextureBuffer La texture résultant de la passe.
     * @param {Camera} usedCamera La caméra utilisée par le shader.
     */
    constructor(name, resultTextureBuffer, usedCamera) {
        this.name = name;
        this.textureBuffer = resultTextureBuffer;
        this.usedCamera = usedCamera;
    }

    /**
     * Permet d'obtenir la texture du résultat.
     * @returns {WebGLTexture} La texture du résultat.
     */
    getTexture() {
        return this.textureBuffer;
    }
}