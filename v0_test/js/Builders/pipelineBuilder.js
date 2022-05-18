let pipelines;

function buildPipelines() {
    pipelines = new Array();
    buildTestPipelines();
    buildDefaultPipelines();
}


function buildDefaultPipelines() {

    let blinnPhongRenderer = new BlinnPhong(shaders.get("blinnPhongShadow"), canvas.width, canvas.height);
    createValueSlider_UI("ambiant", blinnPhongRenderer, "ambiant", 0.0, .5, 0.01);

    let exposureRenderer = new Exposure(shaders.get("exposure"), "AllinOne", "ExposedImage", canvas.width, canvas.height);
    createValueSlider_UI("exposure", exposureRenderer, "exposition", 0.0, 10.0, 0.1);

    let gammaCorrectionRenderer = new GammaCorrection(shaders.get("gammaCorrection"), "ExposedImage", "Final", canvas.width, canvas.height);
    createValueSlider_UI("gamma", gammaCorrectionRenderer, "gamma", 0.5, 5.0, 0.1);


    let extractRenderer = new ExtractColorByBrigthness(shaders.get("extractColorByBrigthness"), 1.0, vec4.clone([0.0, 0.0, 0.0, 1.0]), "BlinnPhong", "Extract", canvas.width, canvas.height);
    createValueSlider_UI("seuil", extractRenderer, "seuil", 0.0, 2.0, 0.05);

    let gaussianRenderer = new GaussianBlur(shaders.get("gaussianBlur"), 10.0, "Extract", "Bloom", canvas.width*0.3, canvas.height*0.3);
    createValueSlider_UI("nbPasses", gaussianRenderer, "nb passes", 0.0, 100.0, 2.0);


    
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

    let shadowRenderer = new Shadow(shaders.get("shadowPCF"), canvas.width, canvas.height);
    createValueSlider_UI("bias", shadowRenderer, "shadow bias", 0.0, 0.02, 0.001);





    let defalutPipeline = new ShaderPipeline();

    //GPass
    defalutPipeline.addShader(new TextureGBuffer(shaders.get("textureGBuffer"), canvas.width, canvas.height));
    //Skybox
    defalutPipeline.addShader(new Skybox(shaders.get("skybox"), skybox, canvas.width, canvas.height));
    //Shadow
    defalutPipeline.addShader(new DepthMap(shaders.get("depthMap"), depthCamera, 1024, 1024));
    defalutPipeline.addShader(shadowRenderer);
    //Light : blinnPhongWithShadows
    defalutPipeline.addShader(blinnPhongRenderer);
    //Bloom
    defalutPipeline.addShader(extractRenderer);
    defalutPipeline.addShader(gaussianRenderer);
    //Fusion
    defalutPipeline.addShader(new Fusion(shaders.get("fusion"), ["BlinnPhong", "Skybox", "Bloom"], "AllinOne", canvas.width, canvas.height));
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
    let nb = 6.0;
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

    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRawR"), "Shadow",              w * 0.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "BlinnPhong",          w * 1.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "Extract",             w * 2.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "Bloom",               w * 3.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "AllinOne",            w * 4.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "ExposedImage",        w * 5.0, startH, w, h));
    
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
    // //Light : blinnPhong
    // p.addShader(new BlinnPhong(shaders.get("blinnPhong"), canvas.width, canvas.height, false));

    // //TEST
    // let extract = new ExtractColorByBrigthness(shaders.get("extractColorByBrigthness"), 1.0, vec4.clone([0.0, 0.0, 0.0, 1.0]), "BlinnPhong", "Extract", canvas.width, canvas.height);
    // createValueSlider_UI("seuil", extract, "seuil", 0.0, 2.0, 0.05);
    // p.addShader(extract);

    // let gaussian = new GaussianBlur(shaders.get("gaussianBlur"), 2.0, "Extract", "Bloom", canvas.width*0.1, canvas.height*0.1);
    // createValueSlider_UI("nbPasses", gaussian, "nb passes", 2.0, 100.0, 2.0);
    // p.addShader(gaussian);

    // //Render
    // p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "Bloom"));

    // pipelines.push(p);

}