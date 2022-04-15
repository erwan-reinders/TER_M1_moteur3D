let shaders;

/**
 * Initialise the GBuffer shader.
 * The models that uses this shader requires
 * @requires diffuseTexture a texture for the diffuse component
 * @requires specularTexture a texture for the specular component
 * and can have
 * @param diffuseFactor a vec3 that will be multiplied to the diffuse component
 * @param specularFactor a vec3 that will be multiplied to the specular component
 */
function initGBuffer() {
    s = new ShaderProgram("MVPVertexShader.glsl", "GBufferTextureFragmentShader.glsl");
    s.use();
    // uniform for vertex shader
    s.setUniform("uModelMatrix",      valType.Mat4fv);
    s.setUniform("uViewMatrix",       valType.Mat4fv);
    s.setUniform("uProjectionMatrix", valType.Mat4fv);
    s.setUniform("uNormalMatrix",     valType.Mat4fv);

    // uniform for fragment shader
    s.setUniform("uDiffuseTexture",  valType.i1);
    s.setUniform("uSpecularTexture", valType.i1);
    s.setUniform("uDiffuseFactor",   valType.f3v);
    s.setUniform("uSpecularFactor",  valType.f1);

    s.setAllPos();

    s.framebuffer = new Framebuffer(canvas.width, canvas.height, 3);
    s.setBeforeAnyRendering(function () {
        this.framebuffer.use();
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        Framebuffer.clear();
    });
    s.setBeforeRenderFunction(function (model, scene) {
        this.use();
        //Pour le vertex shader
        this.setUniformValueByName("uProjectionMatrix", scene.matrix.projectionMatrix);
        this.setUniformValueByName("uViewMatrix",       scene.matrix.viewMatrix);
        this.setUniformValueByName("uNormalMatrix",     scene.matrix.normalMatrix);

        this.setUniformValueByName("uModelMatrix", model.matrix.modelMatrix);
        
        this.framebuffer.use();

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, model.diffuseTexture);
        this.setUniformValueByName("uDiffuseTexture", 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, model.specularTexture);
        this.setUniformValueByName("uSpecularTexture", 1);

        let diffuseFactor  = (model.diffuseFactor)  ? model.diffuseFactor  : vec3.clone([1.0, 1.0, 1.0]);
        let specularFactor = (model.specularFactor) ? model.specularFactor : 1.0;
        this.setUniformValueByName("uDiffuseFactor",  diffuseFactor);
        this.setUniformValueByName("uSpecularFactor", specularFactor);
    });
    s.setAfterRenderFunction(function (model, scene) {
        Framebuffer.clear();
    });

    shaders.set("textureGBuffer", s);
}

function initLight() {
    s = new ShaderProgram("ScreenPosVertexShader.glsl", "GBufferTestLightFragmentShader.glsl");
    s.use();

    s.setUniform("gPosition",   valType.i1);
    s.setUniform("gNormal",     valType.i1);
    s.setUniform("gAlbedoSpec", valType.i1);

    s.setAllPos();

    s.setBeforeRenderFunction(function (model, scene) {
        this.setUniformValueByName("gPosition", 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, shaders.get("basicGBuffer").framebuffer.textures[0]);

        this.setUniformValueByName("gNormal", 1);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, shaders.get("basicGBuffer").framebuffer.textures[1]);

        this.setUniformValueByName("gAlbedoSpec", 2);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, shaders.get("basicGBuffer").framebuffer.textures[2]);
    });

    shaders.set("testGBufferLight", s);



    s = new ShaderProgram("ScreenPosVertexShader.glsl", "LightBlinnPhongFragmentShader.glsl");
    s.use();

    s.setUniform("gPosition",   valType.i1);
    s.setUniform("gNormal",     valType.i1);
    s.setUniform("gAlbedoSpec", valType.i1);

    s.setUniform("uViewPos",    valType.f3v);

    s.setAllPos();

    s.setBeforeRenderFunction(function (model, scene) {
        this.setUniformValueByName("gPosition", 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, shaders.get("textureGBuffer").framebuffer.textures[0]);

        this.setUniformValueByName("gNormal", 1);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, shaders.get("textureGBuffer").framebuffer.textures[1]);

        this.setUniformValueByName("gAlbedoSpec", 2);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, shaders.get("textureGBuffer").framebuffer.textures[2]);
        
        this.setUniformValueByName("uViewPos",    scene.current_camera.position);
    });

    shaders.set("lightBlinnPhong", s);
}

function initShaders() {
    shaders = new Map();
    
    initGBuffer();

    initLight();
}