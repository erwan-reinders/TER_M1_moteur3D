/** ChainRenderer Classe shader permettant d'appliquer un chaînage de shader renderer.
 * @extends ShaderRenderer
 * Rendu sur : 
 *  Dépend des renderers.
 * Utilise :
 *  Dépend du premier renderers.
 * Permet d'obtenir :
 *  L'ensemble des résultats des renderers.
 */
class ChainRenderer extends ShaderRenderer {
    
    /**
     * Construit le faiseur de rendu permettant de dessiner une texture sur une zone de l'ecran.
     * @inheritdoc
     * @param {ShaderRenderer[]} shaderRenderers Une liste de ShaderRenderer.
     * @param {boolean} addToPipeline Doit-on ajouter les résultats à la pipeline courrante?
     */
    constructor(shaderRenderers, addToPipeline = true) {
        super(undefined);

        this.addToPipeline = addToPipeline;

        this.pipeline = new ShaderPipeline();
        this.pipeline.shaderRenderers = shaderRenderers;
    }

    /** @inheritdoc*/
    usePreviousResult(shaderResults) {
        if (this.addToPipeline) {
            this.pipeline.shaderRendererResults = shaderResults;
        }
        else {
            shaderResults.forEach(result => {
                this.pipeline.shaderRendererResults.set(result.name, result);
            });
        }
    }

    /** @inheritdoc*/
    getRenderResults() {
        return this.pipeline.shaderRendererResults;
    }

    /** @inheritdoc*/
    initFromScene(scene) {
        // Rien à initialiser.
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
        this.pipeline.render(scene);
        return this.getRenderResults();
    }
}