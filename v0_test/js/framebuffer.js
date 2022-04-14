

class Framebuffer {
    static clear() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    constructor(SCR_WIDTH, SCR_HEIGHT, nbTextures) {
        this.framebuffer = null;
        this.textures = new Array(nbTextures);
        this.rboDepth = null;
        this.init(SCR_WIDTH, SCR_HEIGHT);
    }

    update(SCR_WIDTH, SCR_HEIGHT) {
        for (let i = 0; i < this.textures.length; i++) {
            gl.deleteTexture(this.textures[i]);
        }
        gl.deleteFramebuffer(this.framebuffer);
        this.init(SCR_WIDTH, SCR_HEIGHT);
    }

    init(SCR_WIDTH, SCR_HEIGHT) {
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
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, SCR_WIDTH, SCR_HEIGHT, 0, gl.RGBA, gl.FLOAT, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, this.textures[i], 0);

            attachements.push(gl.COLOR_ATTACHMENT0 + i);
        }
        gl.drawBuffers(attachements);
        
        this.rboDepth = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.rboDepth);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, SCR_WIDTH, SCR_HEIGHT);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.rboDepth);

        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
            message.error("FRAMEBUFFER INIT", "Framebuffer not complete!");

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    use() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    }

};