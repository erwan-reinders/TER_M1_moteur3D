/**
 * Enumération des modes de rendu.
 * On affecte directement le comportement à appliquer.
 */
const RenderingMode = {
    scene : function(scene) {
        scene.models.forEach(model => {
            if (this.shouldRenderOnModel(model)) {
                this.setModelData(model);
                model.render();
            }
        });
    },
    quad : function(scene) {
        scene.quad.render();
    },
    cube : function(scene) {
        scene.cube.render();
    },
};

/** Classe modélisant un comportement effectué par un shader. */
class ShaderRenderer {

    /**
     * Construit le ShaderRender.
     * @param {ShaderProgram} shaderProgram Le shader à utiliser.
     */
    constructor(shaderProgram) {
        this.shaderProgram = shaderProgram;

        this.camera         = undefined;        // La caméra utilisé pour le rendu.
        this.framebuffer    = undefined;   // Le framebuffer du rendu.
        this.renderingMode  = undefined; // Le mode de rendu.


        // Comportement de classe abstraite :
        if (this.constructor === ShaderRenderer) {
            message.error("SHADER_RENDERER", "ShaderRenderer est abstraite, elle ne doit pas être instanciée.");
        }
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
        this.renderingMode(scene);
        return this.getRenderResults();
    }
}