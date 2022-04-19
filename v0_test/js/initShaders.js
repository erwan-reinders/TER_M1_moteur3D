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
    s.setBeforeRenderFunction(function (previousModelToRender, model, scene) {
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
    s.setAfterRenderFunction(function (previousModelToRender, model, scene) {
        Framebuffer.clear();
    });

    shaders.set("textureGBuffer", s);
}


function initLight() {
    s = new ShaderProgram("ScreenPosVertexShader.glsl", "LightBlinnPhongFragmentShader.glsl");
    s.use();

    s.setUniform("gPosition",   valType.i1);
    s.setUniform("gNormal",     valType.i1);
    s.setUniform("gAlbedoSpec", valType.i1);

    s.setUniform("uViewPos",    valType.f3v);

    let NR_LIGHTS = 8;
    for (let i = 0; i < NR_LIGHTS; i++) {
        s.setUniform("uLights["+i+"].Position"  , valType.f3v);
        s.setUniform("uLights["+i+"].Color"     , valType.f3v);
        s.setUniform("uLights["+i+"].Linear"    , valType.f1);
        s.setUniform("uLights["+i+"].Quadratic" , valType.f1);
    }

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
        
        this.setUniformValueByName("uViewPos",    scene.current_camera.position);

        for (let i = 0; i < scene.lights.length; i++) {
            this.setUniformValueByName("uLights["+i+"].Position"  , scene.lights[i].position);
            this.setUniformValueByName("uLights["+i+"].Color"     , scene.lights[i].color);
            this.setUniformValueByName("uLights["+i+"].Linear"    , scene.lights[i].linear);
            this.setUniformValueByName("uLights["+i+"].Quadratic" , scene.lights[i].quadratic);
        }
    });
    s.setAfterRenderFunction(function (previousModelToRender, model, scene) {
        Framebuffer.clear();
    });

    shaders.set("lightBlinnPhong", s);
}

function initPostEffect() {
    s = new ShaderProgram("ScreenPosVertexShader.glsl", "PostEffectGammaCorrection.glsl");
    s.use();

    s.setUniform("inputColor", valType.i1);

    s.setUniform("gamma", valType.f1);

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

        this.setUniformValueByName("inputColor", 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, previousModelToRender.shader.framebuffer.textures[0]);

        let gamma = model.gamma ?? 2.2;
        this.setUniformValueByName("gamma", gamma);
    });
    s.setAfterRenderFunction(function (previousModelToRender, model, scene) {
        Framebuffer.clear();
    });


    shaders.set("postEffectGammaCorrection", s);
}

function initEnd() {
    s = new ShaderProgram("ScreenPosVertexShader.glsl", "EndFragmentShader.glsl");
    s.use();

    s.setUniform("inputColor", valType.i1);

    s.setAllPos();

    s.setBeforeRenderFunction(function (previousModelToRender, model, scene) {
        this.use();

        this.setUniformValueByName("inputColor", 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, previousModelToRender.shader.framebuffer.textures[0]);
    });

    shaders.set("end", s);
}

function initShaders() {
    shaders = new Map();
    
    initGBuffer();

    initLight();

    initPostEffect();

    initEnd();

    s = new ShaderProgram("ScreenPosVertexShader.glsl", "fusionColorFragmentShader.glsl");
    s.use();

    s.setUniform("inputColor1", valType.i1);
    s.setUniform("inputColor2", valType.i1);

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

        this.setUniformValueByName("inputColor1", 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, model.texture0.framebuffer.textures[0]);
        this.setUniformValueByName("inputColor2", 1);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, model.texture1.framebuffer.textures[0]);
    });
    s.setAfterRenderFunction(function (previousModelToRender, model, scene) {
        Framebuffer.clear();
    });
    shaders.set("fusion", s);


    s = new ShaderProgram("VPFragCoordVertexShader.glsl", "testSkyboxFragmentShader.glsl");
    s.use();

    s.setUniform("uProjectionMatrix", valType.Mat4fv);
    s.setUniform("uViewMatrix",       valType.Mat4fv);

    s.setUniform("skybox", valType.i1);

    s.setAllPos();
    s.framebuffer = new Framebuffer(canvas.width, canvas.height, 1);
    s.setBeforeAnyRendering(function () {
        this.framebuffer.use();
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        Framebuffer.clear();
    });
    s.setBeforeRenderFunction(function (previousModelToRender, model, scene) {
        this.use();

        gl.depthFunc(gl.LEQUAL);

        this.framebuffer.copyBitsOf(scene.models[0].shader.framebuffer, gl.DEPTH_BUFFER_BIT);
        //this.framebuffer.copyBitsOf(scene.models[0].shader.framebuffer, gl.COLOR_BUFFER_BIT);
        this.framebuffer.use();

        this.setUniformValueByName("uProjectionMatrix", scene.matrix.projectionMatrix);
        this.setUniformValueByName("uViewMatrix",       scene.matrix.viewMatrix);

        this.setUniformValueByName("skybox", 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, model.cubemap);
    });
    s.setAfterRenderFunction(function (previousModelToRender, model, scene) {
        Framebuffer.clear();
        gl.depthFunc(gl.LESS);
    });

    shaders.set("skybox", s);
}