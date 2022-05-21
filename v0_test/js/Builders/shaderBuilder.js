let shaders;


function buildShaders() {
    shaders = new Map();

    shaders.set("GBuffer",        new ShaderProgram("MVPVertexShader.glsl",      "GBuffer.glsl"));
    shaders.set("textureGBuffer", new ShaderProgram("MVPVertexShader.glsl",      "GBufferTextureFragmentShader.glsl"));
    shaders.set("depthMap",       new ShaderProgram("MVPDepthVertexShader.glsl", "Depth.glsl"));

    shaders.set("applyToScreenRaw",             new ShaderProgram("ScreenPosVertexShader.glsl", "EndFragmentShader.glsl"));
    shaders.set("applyToScreenRawR",            new ShaderProgram("ScreenPosVertexShader.glsl", "ApplyRawR.glsl"));
    shaders.set("applyToScreen",                new ShaderProgram("ScreenPosVertexShader.glsl", "ApplyRGB.glsl"));
    shaders.set("applyToScreenA",               new ShaderProgram("ScreenPosVertexShader.glsl", "ApplyAlpha.glsl"));
    shaders.set("fusion",                       new ShaderProgram("ScreenPosVertexShader.glsl", "fusion.glsl"));
    shaders.set("blinnPhong",                   new ShaderProgram("ScreenPosVertexShader.glsl", "LightBlinnPhongFragmentShader.glsl"));
    shaders.set("blinnPhongShadow",             new ShaderProgram("ScreenPosVertexShader.glsl", "BlinnPhongShadow.glsl"));
    shaders.set("blinnPhongShadowSSAO",         new ShaderProgram("ScreenPosVertexShader.glsl", "BlinnPhongShadowSSAO.glsl"));
    shaders.set("blinnPhongShadowSSAOOneLight", new ShaderProgram("ScreenPosVertexShader.glsl", "BlinnPhongShadowSSAOOneLight.glsl"));
    shaders.set("exposure",                     new ShaderProgram("ScreenPosVertexShader.glsl", "exposure.glsl"));
    shaders.set("gammaCorrection",              new ShaderProgram("ScreenPosVertexShader.glsl", "PostEffectGammaCorrection.glsl"));
    shaders.set("shadow",                       new ShaderProgram("ScreenPosVertexShader.glsl", "shadow.glsl"));
    shaders.set("shadowPCF",                    new ShaderProgram("ScreenPosVertexShader.glsl", "shadowPCF.glsl"));
    shaders.set("shadowPCFautoBias",            new ShaderProgram("ScreenPosVertexShader.glsl", "shadowPCFautoBias.glsl"));
    shaders.set("kernelR",                      new ShaderProgram("ScreenPosVertexShader.glsl", "kernelR.glsl"));
    shaders.set("kernel4R",                     new ShaderProgram("ScreenPosVertexShader.glsl", "kernel4R.glsl"));
    shaders.set("gaussianBlur",                 new ShaderProgram("ScreenPosVertexShader.glsl", "gaussianBlur.glsl"));
    shaders.set("ssao",                         new ShaderProgram("ScreenPosVertexShader.glsl", "ssao.glsl"));
    shaders.set("extractColorByBrigthness",     new ShaderProgram("ScreenPosVertexShader.glsl", "extractColorByBrigthness.glsl"));
    shaders.set("cubemapReflexion",             new ShaderProgram("ScreenPosVertexShader.glsl", "cubeMapReflexionFragmentShader.glsl"));
    
    shaders.set("skybox", new ShaderProgram("VPFragCoordVertexShader.glsl", "skybox.glsl"));


    shaders.set("forwardCollider", new ShaderProgram("ColliderVertexShader.glsl", "ColliderFragmentShader.glsl"));

    return shaders;
}