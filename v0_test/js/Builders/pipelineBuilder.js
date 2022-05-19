let pipelines;

function buildPipelines() {
    pipelines = new Array();
    buildTestPipelines();
    buildDefaultPipelines();
}


function buildDefaultPipelines() {

    createSeparateur("Rendering");
    let blinnPhongRenderer = new BlinnPhong(shaders.get("blinnPhongShadowSSAO"), canvas.width, canvas.height);
    createValueSlider_UI("ambiant", blinnPhongRenderer, "ambiant", 0.0, 1.0, 0.05);

    let exposureRenderer = new Exposure(shaders.get("exposure"), "AllinOne", "ExposedImage", canvas.width, canvas.height);
    createValueSlider_UI("exposure", exposureRenderer, "exposition", 0.0, 10.0, 0.1);

    let gammaCorrectionRenderer = new GammaCorrection(shaders.get("gammaCorrection"), "ExposedImage", "Final", canvas.width, canvas.height);
    createValueSlider_UI("gamma", gammaCorrectionRenderer, "gamma", 0.5, 5.0, 0.1);


    createSeparateur("Bloom");
    let canvasScale = 0.3;
    let extractRenderer = new ExtractColorByBrigthness(shaders.get("extractColorByBrigthness"), 0.95, vec4.clone([0.0, 0.0, 0.0, 1.0]), "BlinnPhongAndSkybox", "Extract", canvas.width * canvasScale, canvas.height * canvasScale);
    createValueSlider_UI("seuil", extractRenderer, "seuil", 0.0, 2.0, 0.05);

    let gaussianRenderer = new GaussianBlur(shaders.get("gaussianBlur"), 20.0, "Extract", "Bloom", canvas.width * canvasScale, canvas.height * canvasScale);
    createValueSlider_UI("nbPasses", gaussianRenderer, "passes", 0.0, 100.0, 2.0);


    
    //For the skybox
    let skybox = getCubeMapImage([
        "data/img/skybox/right.jpg",
        "data/img/skybox/left.jpg",
        "data/img/skybox/top.jpg",
        "data/img/skybox/bottom.jpg",
        "data/img/skybox/front.jpg",
        "data/img/skybox/back.jpg"
        ]);

    //For the shadow
    let depthCamera = new Camera(vec3.clone([-1.0, 5.0, -2.0]), vec3.clone([0.0, 1.0, 0.0]), vec3.clone([0.0, 0.0, 0.0]));
    depthCamera.setOrthographic();
    depthCamera.setOrthographicSize(5.0);

    createSeparateur("Shadow");
    let shadowRenderer = new Shadow(shaders.get("shadowPCF"), canvas.width, canvas.height);
    createValueSlider_UI("bias", shadowRenderer, "bias", 0.0, 0.02, 0.001);

    //For the SSAO
    createSeparateur("SSAO");
    let ssao = new SSAO(shaders.get("ssao"), 32, 4, 4, canvas.width, canvas.height);
    createValueSlider_UI("kernelSize",     ssao, "number of samples", 1.0, 128.0, 1.0);
    createValueSlider_UI("radius",         ssao, "radius",            0.0, 1.0, 0.05);
    createValueSlider_UI("depthBias",      ssao, "depth bias",        0.0, .5, 0.001);
    createValueSlider_UI("angleBias",      ssao, "angle bias",        0.0, .5, 0.001);
    createValueSlider_UI("occlusionPower", ssao, "power",             0.0, 10.0, 0.01);

    let blurVal = 1.0 / 16.0;
    let blurKernel4 = new Float32Array([
        blurVal, blurVal, blurVal, blurVal,
        blurVal, blurVal, blurVal, blurVal,
        blurVal, blurVal, blurVal, blurVal,
        blurVal, blurVal, blurVal, blurVal
    ]);





    let defalutPipeline = new ShaderPipeline();

    //GPass
    defalutPipeline.addShader(new TextureGBuffer(shaders.get("textureGBuffer"), canvas.width, canvas.height));
    //Skybox
    defalutPipeline.addShader(new Skybox(shaders.get("skybox"), skybox, canvas.width, canvas.height));
    //Shadow
    defalutPipeline.addShader(new DepthMap(shaders.get("depthMap"), depthCamera, 1024, 1024));
    defalutPipeline.addShader(shadowRenderer);
    //SSAO
    defalutPipeline.addShader(ssao);
    defalutPipeline.addShader(new Kernel(shaders.get("kernel4R"), blurKernel4, "SSAO", "SSAO", canvas.width, canvas.height));
    //Light : blinnPhongWithShadows
    defalutPipeline.addShader(blinnPhongRenderer);
    //Fusion 1 : BlinnPhong avec la skybox
    defalutPipeline.addShader(new Fusion(shaders.get("fusion"), ["BlinnPhong", "Skybox"], "BlinnPhongAndSkybox", canvas.width, canvas.height));
    //Bloom
    defalutPipeline.addShader(extractRenderer);
    defalutPipeline.addShader(gaussianRenderer);
    //Fusion 2
    defalutPipeline.addShader(new Fusion(shaders.get("fusion"), ["BlinnPhongAndSkybox", "Bloom"], "AllinOne", canvas.width, canvas.height));
    //Post effects
    defalutPipeline.addShader(exposureRenderer);
    defalutPipeline.addShader(gammaCorrectionRenderer);


    


    let p = new ShaderPipeline();

    defalutPipeline.shaderRenderers.forEach(shaderRenderer => {
        p.addShader(shaderRenderer);
    });
    
    //Render
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"), "Final"));
    pipelines.push(p);




    //Same but with preview of the different steps

    p = new ShaderPipeline();

    defalutPipeline.shaderRenderers.forEach(shaderRenderer => {
        p.addShader(shaderRenderer);
    });
    
    //Render
    let nb = 7.0;
    let w = canvas.width  / nb;
    let h = canvas.height / nb;
    //let startH = canvas.height * (nb-1.0) / nb;
    let startH = 0.0;
    p.addShader(new ApplyToScreen(shaders.get("applyToScreen"),     "Position",            w * 0.0, startH+h, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreen"),     "Normal",              w * 1.0, startH+h, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreen"),     "ColorSpecular",       w * 2.0, startH+h, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenA"),    "ColorSpecular",       w * 3.0, startH+h, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "Skybox",              w * 4.0, startH+h, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRawR"), "DepthMap",            w * 5.0, startH+h, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRawR"), "Shadow",              w * 6.0, startH+h, w, h));

    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "SSAO",                w * 0.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "BlinnPhong",          w * 1.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "Extract",             w * 2.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "Bloom",               w * 3.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "AllinOne",            w * 4.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "ExposedImage",        w * 5.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "Final",               w * 6.0, startH, w, h));
    
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "Final"));
    /*
    p.addShader(new ApplyToScreen(shaders.get("applyToScreen"),     "Position",            w * 0.0, startH+h, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreen"),     "Normal",              w * 1.0, startH+h, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreen"),     "ColorSpecular",       w * 2.0, startH+h, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenA"),    "ColorSpecular",       w * 3.0, startH+h, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "Skybox",              w * 4.0, startH+h, w, h));

    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRawR"), "DepthMap",            w * 0.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRawR"), "Shadow",              w * 1.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "BlinnPhong",          w * 2.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "BlinnPhongAndSkybox", w * 3.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "Final",               w * 4.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "Final"));
    */
    // p.addShader(new ApplyToScreen(shaders.get("applyToScreen"),     "Position",            w * 0.0, startH+2*h, w, h));
    // p.addShader(new ApplyToScreen(shaders.get("applyToScreen"),     "Normal",              w * 1.0, startH+2*h, w, h));
    // p.addShader(new ApplyToScreen(shaders.get("applyToScreen"),     "ColorSpecular",       w * 2.0, startH+2*h, w, h));

    // p.addShader(new ApplyToScreen(shaders.get("applyToScreenA"),    "ColorSpecular",       w * 0.0, startH+h, w, h));
    // p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "Skybox",              w * 1.0, startH+h, w, h));
    // p.addShader(new ApplyToScreen(shaders.get("applyToScreenRawR"), "DepthMap",            w * 2.0, startH+h, w, h));

    // p.addShader(new ApplyToScreen(shaders.get("applyToScreenRawR"), "Shadow",              w * 0.0, startH, w, h));
    // p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "BlinnPhong",          w * 1.0, startH, w, h));
    // p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "BlinnPhongAndSkybox", w * 2.0, startH, w, h));

    pipelines.push(p);

    return pipelines;
}

function buildTestPipelines() {
    // let p = new ShaderPipeline();

    // //GPass
    // p.addShader(new TextureGBuffer(shaders.get("textureGBuffer"), canvas.width, canvas.height));

    // let canvasScale = 0.5;
    // let ssao = new SSAO(shaders.get("ssao"), 32, 4, 4, canvas.width, canvas.height);
    // ssao.noiseScale = 0.25;
    // createValueSlider_UI("kernelSize", ssao, "ssao kernel size", 1.0, 128.0, 1.0);
    // createValueSlider_UI("radius", ssao, "ssao radius", 0.0, 1.0, 0.05);
    // createValueSlider_UI("depthBias", ssao, "ssao depth bias", 0.0, .5, 0.001);
    // createValueSlider_UI("angleBias", ssao, "ssao angle bias", 0.0, .5, 0.001);
    // createValueSlider_UI("noiseScale", ssao, "ssao noise scale", 0.0, 1.0, 0.01);
    // createValueSlider_UI("occlusionPower", ssao, "ssao power", 0.0, 5.0, 0.01);
    // p.addShader(ssao);

    // let blurVal = 1.0 / 16.0;
    // let blur = new Float32Array([
    //     blurVal, blurVal, blurVal, blurVal,
    //     blurVal, blurVal, blurVal, blurVal,
    //     blurVal, blurVal, blurVal, blurVal,
    //     blurVal, blurVal, blurVal, blurVal
    // ]);
    // let blurRenderer = new Kernel(shaders.get("kernel4R"), blur, "SSAO", "SSAOBlur", canvas.width * canvasScale, canvas.height * canvasScale);
    // p.addShader(blurRenderer);

    // //Render
    // p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "SSAOBlur"));

    // pipelines.push(p);

}