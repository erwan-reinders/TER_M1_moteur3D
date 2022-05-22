/** RenderOnCubemap Classe shader permettant de rendre un shaderRenderer à partir dun point de vue afin d'appliquer le résultat sur une cubemap.
 * @extends ShaderRenderer
 * Rendu sur : 
 *  Quad
 * Utilise :
 *  Dépend du shaderRenderer.
 * Permet d'obtenir :
 *  Texture cubemap de nom passé en parametre.
 */
class RenderOnCubemap extends ShaderRenderer {
    
    /**
     * Construit le faiseur de rendu permettant de dessiner un éclairage BlinnPhong.
     * @inheritdoc
     * @param {ShaderRenderer} renderer Le renderer permettant d'obtenir la cubemap.
     * @param {Float32Array} position Les coordonnées du centre de la cubemap à rendre.
     * @param {string} textureWriteName Le nom de la texture de sortie.
     * @param {number}  width  La résolution horizontale du rendu en nombre de pixel.
     * @param {number}  height La résolution verticale du rendu en nombre de pixel.
     */
    constructor(shaderProgram, renderer, position, rendererTextureReadname, textureWriteName, width, height) {
        super(shaderProgram);

        this.renderingMode = RenderingMode.quad;
        
        this.renderer = renderer;
        this.position = position;
        this.textureWriteName = textureWriteName;
        this.rendererTextureReadname = rendererTextureReadname;

        this.camera = new Camera(position, vec3.clone([0.0, 1.0, 0.0]), vec3.add([], position, [0.0, 0.0, -1.0]));
        this.camera.fieldOfView = Math.PI * 0.5;
        this.camera.aspect = width / height;

        this.cameraForwards = [
            vec3.clone([1, 0, 0]),
            vec3.clone([-1, 0, 0]),
            vec3.clone([0, 1, 0]),
            vec3.clone([0, -1, 0]),
            vec3.clone([0, 0, 1]),
            vec3.clone([0, 0, -1]),
        ]
        // this.cameraUps = [
        //     vec3.clone([0, -1, 0]),
        //     vec3.clone([0, -1, 0]),
        //     vec3.clone([0, 0, 1]),
        //     vec3.clone([0, 0, -1]),
        //     vec3.clone([0, -1, 0]),
        //     vec3.clone([0, -1, 0]),
        // ]
        this.cameraUps = [
            vec3.clone([0, 1, 0]),
            vec3.clone([0, 1, 0]),
            vec3.clone([1, 0, 0]),
            vec3.clone([1, 0, 0]),
            vec3.clone([0, 1, 0]),
            vec3.clone([0, 1, 0]),
        ]

        this.sceneCamera = undefined;

        this.shaderProgram.use();
        this.shaderProgram.setUniform("inputColor", valType.texture2D);
        this.shaderProgram.setAllPos();

        this.framebuffer = new Framebuffer(width, height, 1);
        this.framebuffers = new Array();
        for (let i = 0; i < 6; i++) {
            this.framebuffers[i] = new Framebuffer(width, height, 1);
        }
        this.cubemap = getCubeMap(width, height);
    }

    /** @inheritdoc*/
    usePreviousResult(shaderResults) {
        this.renderer.usePreviousResult(shaderResults);
    }

    /** @inheritdoc*/
    getRenderResults() {
        let renderResults = new Array();
        renderResults.push(new ShaderRendererResult(this.textureWriteName, this.cubemap, this));
        // renderResults.push(new ShaderRendererResult(this.textureWriteName, this.cubemapTest.texture, this));
        for (let i = 0; i < 6; i++) {
            renderResults.push(new ShaderRendererResult("Inside"+this.textureWriteName+i, this.framebuffers[i].textures[0], this));
        }
        return renderResults;
    }

    /** @inheritdoc*/
    initFromScene(scene) {
        Framebuffer.clear();
        this.sceneCamera = scene.camera;
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

        for (let i = 0; i < 6; i++) {
            vec3.add(this.camera.target, this.camera.position, this.cameraForwards[i]);
            this.camera.up = this.cameraUps[i];
            this.camera.updateMatrix();
            scene.camera = this.camera;
            
            // this.framebuffers[i].use();
            // gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, this.cubemap, 0);
            // this.framebuffers[i].clearColorAndDepth();
            
            // this.renderer.setFrameBuffer(this.framebuffers[i]);
            // this.renderer.render(scene);

            this.framebuffers[i].use();
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.framebuffers[i].textures[0], 0);
            this.framebuffers[i].clearColorAndDepth();
            
            this.renderer.setFrameBuffer(this.framebuffers[i]);
            this.renderer.render(scene);
        }

        this.framebuffer.use();
        for (let i = 0; i < 6; i++) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X+i, this.cubemap, 0);
            this.framebuffer.copyBitsOf(this.framebuffers[i], gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        }


        // for (let i = 0; i < 6; i++) {
        //     vec3.add(this.camera.target, this.camera.position, this.cameraForwards[i]);
        //     this.camera.up = this.cameraUps[i];
        //     this.camera.updateMatrix();
        //     scene.camera = this.camera;
            
        //     let results = this.renderer.render(scene);
        //     let texture = results.get(this.rendererTextureReadname).getTexture();

        //     this.framebuffers[i].use();
        //     gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, this.cubemap, 0);
        //     //gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, this.framebuffers[i].textures[0], 0);
        //     this.framebuffers[i].clearColorAndDepth();
        //     this.shaderProgram.use();
        //     this.shaderProgram.setUniformValueByName("inputColor", 0, texture);
        //     gl.disable(gl.DEPTH_TEST);
        //     this.renderingMode(scene);
        //     gl.enable(gl.DEPTH_TEST);
        // }

        // gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.cubemap);
        // gl.generateMipmap( gl.TEXTURE_CUBE_MAP );
        
        scene.camera = this.sceneCamera;
        
        return this.getRenderResults();
    }
}