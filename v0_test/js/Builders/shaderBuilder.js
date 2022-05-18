let shaders;


function buildShaders() {
    shaders = new Map();

    shaders.set("textureGBuffer" , new ShaderProgram("MVPVertexShader.glsl"      , "GBufferTextureFragmentShader.glsl"));
    shaders.set("depthMap",        new ShaderProgram("MVPDepthVertexShader.glsl",  "Depth.glsl"));

    shaders.set("applyToScreenRaw",  new ShaderProgram("ScreenPosVertexShader.glsl", "EndFragmentShader.glsl"));
    shaders.set("applyToScreenRawR", new ShaderProgram("ScreenPosVertexShader.glsl", "ApplyRawR.glsl"));
    shaders.set("applyToScreen",     new ShaderProgram("ScreenPosVertexShader.glsl", "ApplyRGB.glsl"));
    shaders.set("applyToScreenA",    new ShaderProgram("ScreenPosVertexShader.glsl", "ApplyAlpha.glsl"));
    shaders.set("fusion",            new ShaderProgram("ScreenPosVertexShader.glsl", "fusion.glsl"));
    shaders.set("blinnPhong",        new ShaderProgram("ScreenPosVertexShader.glsl", "LightBlinnPhongFragmentShader.glsl"));
    shaders.set("blinnPhongShadow",  new ShaderProgram("ScreenPosVertexShader.glsl", "BlinnPhongShadow.glsl"));
    shaders.set("gammaCorrection",   new ShaderProgram("ScreenPosVertexShader.glsl", "PostEffectGammaCorrection.glsl"));
    shaders.set("shadow",            new ShaderProgram("ScreenPosVertexShader.glsl", "shadow.glsl"));
    shaders.set("shadowPCF",         new ShaderProgram("ScreenPosVertexShader.glsl", "shadowPCF.glsl"));
    shaders.set("kernelR",           new ShaderProgram("ScreenPosVertexShader.glsl", "kernelR.glsl"));
    
    shaders.set("skybox", new ShaderProgram("VPFragCoordVertexShader.glsl", "skybox.glsl"));


    return shaders;





    /*
    s = new ShaderProgram("ScreenPosVertexShader.glsl", "cubeMapReflexionFragmentShader.glsl");
    s.use();

    s.setUniform("gPosition",   valType.i1);
    s.setUniform("gNormal",     valType.i1);
    s.setUniform("gAlbedoSpec", valType.i1);

    s.setUniform("skybox",      valType.i1);

    s.setUniform("uViewPos",    valType.f3v);

    s.setAllPos();

    s.framebuffer = new Framebuffer(canvas.width, canvas.height, 1);
    s.setBeforeAnyRendering(function () {
        this.framebuffer.use();
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        Framebuffer.clear();
    });
    s.setBeforeRenderFunction(function (previousModelToRender, model, scene) {
        this.use();

        this.framebuffer.use();

        //let shader = shaders.get("textureGBuffer");
        let shader = scene.models[0].shader;
        //let shader = previousModelToRender.shader;

        this.setUniformValueByName("gPosition", 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, shader.framebuffer.textures[0]);

        this.setUniformValueByName("gNormal", 1);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, shader.framebuffer.textures[1]);

        this.setUniformValueByName("gAlbedoSpec", 2);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, shader.framebuffer.textures[2]);
        
        this.setUniformValueByName("uViewPos", scene.current_camera.position);

        this.setUniformValueByName("skybox", 3);
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, model.cubemap);
    });
    s.setAfterRenderFunction(function (previousModelToRender, model, scene) {
        Framebuffer.clear();
    });

    shaders.set("cubeMapReflexion", s);










    s = new ShaderProgram("MVPVertexShader.glsl", "reflexionSOLOFragmentShader.glsl");
    s.use();

    // uniform for vertex shader
    s.setUniform("uModelMatrix",      valType.Mat4fv);
    s.setUniform("uViewMatrix",       valType.Mat4fv);
    s.setUniform("uProjectionMatrix", valType.Mat4fv);
    s.setUniform("uNormalMatrix",     valType.Mat4fv);

    s.setUniform("skybox",      valType.i1);
    s.setUniform("uViewPos",    valType.f3v);

    s.setAllPos();

    s.framebuffer = new Framebuffer(canvas.width, canvas.height, 1);
    s.setBeforeAnyRendering(function () {
        this.framebuffer.use();
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        Framebuffer.clear();
    });
    s.setBeforeRenderFunction(function (previousModelToRender, model, scene) {
        this.use();

        this.framebuffer.use();

        //Pour le vertex shader
        this.setUniformValueByName("uProjectionMatrix", scene.matrix.projectionMatrix);
        this.setUniformValueByName("uViewMatrix",       scene.matrix.viewMatrix);
        this.setUniformValueByName("uNormalMatrix",     scene.matrix.normalMatrix);
        this.setUniformValueByName("uModelMatrix", model.matrix.modelMatrix);
        
        this.setUniformValueByName("uViewPos", scene.current_camera.position);

        this.setUniformValueByName("skybox", 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, model.cubemap);
    });
    s.setAfterRenderFunction(function (previousModelToRender, model, scene) {
        Framebuffer.clear();
    });

    shaders.set("cubeMapReflexionSOLO", s);


    s = new ShaderProgram("MVPVertexShader.glsl", "refractionSOLOFragmentShader.glsl");
    s.use();

    // uniform for vertex shader
    s.setUniform("uModelMatrix",      valType.Mat4fv);
    s.setUniform("uViewMatrix",       valType.Mat4fv);
    s.setUniform("uProjectionMatrix", valType.Mat4fv);
    s.setUniform("uNormalMatrix",     valType.Mat4fv);

    s.setUniform("skybox",      valType.i1);
    s.setUniform("uViewPos",    valType.f3v);
    s.setUniform("uRatio",      valType.f1);

    s.setAllPos();

    s.framebuffer = new Framebuffer(canvas.width, canvas.height, 1);
    s.setBeforeAnyRendering(function () {
        this.framebuffer.use();
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        Framebuffer.clear();
    });
    s.setBeforeRenderFunction(function (previousModelToRender, model, scene) {
        this.use();

        this.framebuffer.use();

        this.framebuffer.copyBitsOf(previousModelToRender.shader.framebuffer, gl.DEPTH_BUFFER_BIT);

        //Pour le vertex shader
        this.setUniformValueByName("uProjectionMatrix", scene.matrix.projectionMatrix);
        this.setUniformValueByName("uViewMatrix",       scene.matrix.viewMatrix);
        this.setUniformValueByName("uNormalMatrix",     scene.matrix.normalMatrix);
        this.setUniformValueByName("uModelMatrix", model.matrix.modelMatrix);
        
        this.setUniformValueByName("uViewPos", scene.current_camera.position);

        this.setUniformValueByName("skybox", 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, model.cubemap);

        let ratio = model.ratio ?? 0.75;
        this.setUniformValueByName("uRatio", ratio);
    });
    s.setAfterRenderFunction(function (previousModelToRender, model, scene) {
        Framebuffer.clear();
    });

    shaders.set("cubeMapRefractionSOLO", s);
    */

}