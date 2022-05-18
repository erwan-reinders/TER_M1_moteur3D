let pipelines;

function buildPipelines() {
    buildDefaultPipelines();
    buildTestPipelines();
}


function buildDefaultPipelines() {
    pipelines = new Array();

    let p;

    let blinnPhongRenderer = new BlinnPhong(shaders.get("blinnPhongShadow"), canvas.width, canvas.height);
    createValueSlider_UI("ambiant", blinnPhongRenderer, "ambiant", 0.0, 1.0, 0.05);

    let gammaCorrectionRenderer = new GammaCorrection(shaders.get("gammaCorrection"), "BlinnPhongAndSkybox", "Final", canvas.width, canvas.height);
    createValueSlider_UI("gamma", gammaCorrectionRenderer, "gamma", 0.5, 5.0, 0.1);

    
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

    p = new ShaderPipeline();

    //GPass
    p.addShader(new TextureGBuffer(shaders.get("textureGBuffer"), canvas.width, canvas.height));
    //Skybox
    p.addShader(new Skybox(shaders.get("skybox"), skybox, canvas.width, canvas.height));
    //Shadow
    p.addShader(new DepthMap(shaders.get("depthMap"), depthCamera, 1024, 1024));
    p.addShader(shadowRenderer);
    //Light : blinnPhongWithShadows
    p.addShader(blinnPhongRenderer);
    //Fusion
    p.addShader(new Fusion(shaders.get("fusion"), ["BlinnPhong", "Skybox"], "BlinnPhongAndSkybox", canvas.width, canvas.height));
    //Render
    p.addShader(gammaCorrectionRenderer);
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"), "Final"));
    pipelines.push(p);


    //Same but with preview of the different steps

    p = new ShaderPipeline();

    //GPass
    p.addShader(new TextureGBuffer(shaders.get("textureGBuffer"), canvas.width, canvas.height));
    //Skybox
    p.addShader(new Skybox(shaders.get("skybox"), skybox, canvas.width, canvas.height));
    //Shadow
    p.addShader(new DepthMap(shaders.get("depthMap"), depthCamera, 1024, 1024));
    p.addShader(shadowRenderer);
    //Light : blinnPhongWithShadows
    p.addShader(blinnPhongRenderer);
    //Fusion
    p.addShader(new Fusion(shaders.get("fusion"), ["BlinnPhong", "Skybox"], "BlinnPhongAndSkybox", canvas.width, canvas.height));

    //Render
    p.addShader(gammaCorrectionRenderer);
    
    let nb = 3.0;
    let w = canvas.width  / nb;
    let h = canvas.height / nb;
    //let startH = canvas.height * (nb-1.0) / nb;
    let startH = 0.0;
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
    p.addShader(new ApplyToScreen(shaders.get("applyToScreen"),     "Position",            w * 0.0, startH+2*h, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreen"),     "Normal",              w * 1.0, startH+2*h, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreen"),     "ColorSpecular",       w * 2.0, startH+2*h, w, h));

    p.addShader(new ApplyToScreen(shaders.get("applyToScreenA"),    "ColorSpecular",       w * 0.0, startH+h, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "Skybox",              w * 1.0, startH+h, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRawR"), "DepthMap",            w * 2.0, startH+h, w, h));

    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRawR"), "Shadow",              w * 0.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "BlinnPhong",          w * 1.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "BlinnPhongAndSkybox", w * 2.0, startH, w, h));

    pipelines.push(p);

    return pipelines;
}

function buildTestPipelines() {
}