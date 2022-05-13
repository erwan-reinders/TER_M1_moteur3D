/** Classe modélisant un comportement effectué par un shader. */
class ShaderRenderer {

    /**
     * Construit le ShaderRender.
     * @param {ShaderProgram} shaderProgram Le shader à utiliser.
     */
    constructor(shaderProgram) {
        this.shaderProgram = shaderProgram;

        this.camera = undefined;    // La caméra utilisé pour le rendu
    }

    /**
     * Récupère les précédente donnée de la Pipeline.
     * @abstract
     * @param {ShaderResult} shaderResults Les précédent résultats de la Pipeline.
     */
    usePreviousResult(shaderResults) {

    }

    /**
     * Permet d'obtenir une liste des résultat du rendu.
     * @abstract
     * @returns {ShaderRendererResult[]} Liste de résultat de rendu.
     */
    getRenderResults() {

    }

    /**
     * Initialise le shader à partir de la scene.
     * @abstract
     * @param {Scene} scene La scene utilisée pour le rendu.
     */
    initFromScene(scene) {

    }

    /**
     * Met à jour les paramètres du shader afin de rendre le modèle.
     * @abstract
     * @param {Model} model Le model que l'on vas rendre.
     */
    setModelData(model) {

    }

    /**
     * Permet de determiner si l'on souhaite rendre les modèles de la scène
     * @abstract
     * @param {Scene} scene La scene que l'on vas rendre.
     * @returns {boolean} Vrai ssi on doit rendre la scene.
     */
    shouldRenderScene(scene) {

    }

    /**
     * Permet de determiner si l'on souhaite rendre le model ou non.
     * @abstract
     * @param {Model} model Le model que l'on vas rendre.
     * @returns {boolean} Vrai ssi on doit rendre le model.
     */
    shouldRenderOnModel(model) {

    }

    /**
     * Fait le rendu de la scene.
     * @param {Scene} scene La scene utilisé pour le rendu.
     * @returns {ShaderRendererResult[]} La liste des résultats de rendu.
     */
    render(scene) {
        this.initFromScene(scene);

        if (this.shouldRenderScene(scene)) {
            scene.models.forEach(model => {
                if (this.shouldRenderOnModel(model)) {
                    this.setModelData(model);
                    model.render();
                }
            });
        }
        else {
            scene.quad.render();
        }

        return this.getRenderResults();
    }
}