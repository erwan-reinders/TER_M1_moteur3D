/** Classe modélisant un framebuffer de webgl */
class Framebuffer {

    /**
     * Permet de dessiner sur le canvas. 
     */
    static clear() {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    static createCubemapDepth(width, height) {
        let framebuffer = new Framebuffer(width, height, 0, false);
        framebuffer.cubemap = getCubeMap(width, height);

        framebuffer.framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.framebuffer);    


        // for (let i = 0; i < 6; i++) {
        //     gl.bindTexture(gl.TEXTURE_CUBE_MAP, framebuffer.cubemap);

        //     gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.R16F, width, height, 0, gl.RED, gl.FLOAT, null);
        //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        //     gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, framebuffer.cubemap, 0);

        // }

        gl.drawBuffers([gl.COLOR_ATTACHMENT0]);

        framebuffer.rboDepth = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, framebuffer.rboDepth);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, framebuffer.rboDepth);

        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
            message.error("FRAMEBUFFER INIT", "Framebuffer not complete!");

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        return framebuffer;
    }

    /**
     * Construit le framebuffer.
     * @param {number} SCR_WIDTH  La largeur de la zone de rendu.
     * @param {number} SCR_HEIGHT la hauteur de la zone de rendu.
     * @param {number} nbTextures le nombre de textures du framebuffer. 
     */
    constructor(SCR_WIDTH, SCR_HEIGHT, nbTextures, init = true) {
        this.framebuffer = null;
        this.textures = new Array(nbTextures);
        this.rboDepth = null;
        this.width = SCR_WIDTH;
        this.height = SCR_HEIGHT;
        
        if (init) {
            this.init();
        }
    }

    /**
     * Met à jour la zone de rendu.
     * @param {number} SCR_WIDTH  la nouvelle largeur de la zone de rendu.
     * @param {number} SCR_HEIGHT la nouvelle hauteur de la zone de rendu.
     */
    update(SCR_WIDTH, SCR_HEIGHT) {
        for (let i = 0; i < this.textures.length; i++) {
            gl.deleteTexture(this.textures[i]);
        }
        gl.deleteFramebuffer(this.framebuffer);
        this.init(SCR_WIDTH, SCR_HEIGHT);
    }

    /**
     * Initialise le framebuffer.
     */
    init() {
        this.framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

        gl.activeTexture(gl.TEXTURE0);
        
        if (!gl.getExtension("EXT_color_buffer_float")) {
            message.error("FRAMEBUFFER INIT", "FLOAT color buffer not available : EXT_color_buffer_float is unavailable on this system.");
        }

        let attachements = new Array();
        for (let i = 0; i < this.textures.length; i++) {
            this.textures[i] = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, this.width, this.height, 0, gl.RGBA, gl.FLOAT, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, this.textures[i], 0);

            attachements.push(gl.COLOR_ATTACHMENT0 + i);
        }
        if (this.textures.length > 0) {
            gl.drawBuffers(attachements);
        } else {
            gl.drawBuffers([]);
        }
        
        this.rboDepth = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.rboDepth);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.rboDepth);

        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
            message.error("FRAMEBUFFER INIT", "Framebuffer not complete!");

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    /**
     * Permet de dessiner sur le framebuffer.
     */
    use() {
        gl.viewport(0, 0, this.width, this.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    }

    /**
     * Supprime les données du framebuffer.
     * @param {GLbitfield} mask Le masque permettant de spécifier la donnée à copier (gl.COLOR_BUFFER_BIT, gl.DEPTH_BUFFER_BIT, gl.STENCIL_BUFFER_BIT). Peut être combiné avec un ou binaire ("|").
     */
    clear(mask) {
        gl.clear(mask);
    }

    /**
     * SUpprime les données de couleur et de profondeur.
     */
    clearColorAndDepth() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    /**
     * Copie les données d'un autre framebuffer.
     * @param {Framebuffer} otherFramebuffer Le framebuffer auquel on veux copier la donnée.
     * @param {GLbitfield} mask Le masque permettant de spécifier la donnée à copier (gl.COLOR_BUFFER_BIT, gl.DEPTH_BUFFER_BIT, gl.STENCIL_BUFFER_BIT). Peut être combiné avec un ou binaire ("|").
     */
    copyBitsOf(otherFramebuffer, mask) {
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, otherFramebuffer.framebuffer);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.framebuffer);
        gl.blitFramebuffer(0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height, mask, gl.NEAREST);
    }

    /**
     * Active et met à jour une texture.
     * @param {number} textureNumber L'identifiant de la texture.
     * @param {WebGLTexture} textureBuffer La texture à mettre.
     */
    setTexture(textureNumber, textureBuffer) {
        gl.activeTexture(gl.TEXTURE0 + textureNumber);
        gl.bindTexture(gl.TEXTURE_2D, textureBuffer);
    }

};