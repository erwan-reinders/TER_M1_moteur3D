/*Classe modélisant les shaders à rendre en une tramme*/
class ShaderPipeline {
    /**
     * Constructeur d'une Pipeline
     **/
    constructor() {
        this.shaderRenderers = [];
        this.shaderRendererResults = new Map();
    }

    /**
     * Méthode permettant d'ajouter un shader à la pipeline
     * @param shaderRenderer : Shader à ajouter à la pipeline
     **/
    addShader(shaderRenderer) {
        this.shaderRenderers.push(shaderRenderer);
    }

    /**
     * Méthode permettant d'obtenir le résultat d'un shader
     * @param key : Clef pour accéder au résultat
     **/
    getResult(key) {
        return this.shaderRendererResults.get(key);
    }

    /**
     * Méthode permettant d'appliquer un résultat
     * @param key : Clef pour accéder au résultat
     * @param result : Resultat à mettre
     **/
    setResult(key, result) {
        this.shaderRendererResults.set(key, result);
    }

    /**
     * Méthode permettant de faire un rendu des shaders de la pipeline.
     * On utilise les ShaderRenderers dans l'ordre d'insertion.
     */
    render(scene) {
        this.shaderRenderers.forEach(shaderRenderer => {
            shaderRenderer.usePreviousResult(this.shaderRendererResults);
            shaderRenderer.render(scene).forEach(
                result => this.setResult(result.name, result)
            );
        });
    }
}