let pipelines;


function buildPipelines() {
    pipelines = new Array();

    let p;

    let blinnPhongRenderer = new BlinnPhong(shaders.get("blinnPhong"), canvas.width, canvas.height);
    createValueSlider_UI("ambiant", blinnPhongRenderer, "ambiant", 0.0, 1.0, 0.05);

    let gammaCorrectionRenderer = new GammaCorrection(shaders.get("gammaCorrection"), "BlinnPhongAndSkybox", "Final", canvas.width, canvas.height);
    createValueSlider_UI("gamma", gammaCorrectionRenderer, "gamma", 0.5, 5.0, 0.1);

    
    
    let skybox = getCubeMapImage([
        "data/img/skybox/right.jpg",
        "data/img/skybox/left.jpg",
        "data/img/skybox/top.jpg",
        "data/img/skybox/bottom.jpg",
        "data/img/skybox/front.jpg",
        "data/img/skybox/back.jpg"
        ]);


    p = new ShaderPipeline();

    p.addShader(new TextureGBuffer(shaders.get("textureGBuffer"), canvas.width, canvas.height));
    p.addShader(new Skybox(shaders.get("skybox"), skybox, canvas.width, canvas.height));
    p.addShader(blinnPhongRenderer);
    p.addShader(new Fusion(shaders.get("fusion"), ["BlinnPhong", "Skybox"], "BlinnPhongAndSkybox", canvas.width, canvas.height));
    p.addShader(gammaCorrectionRenderer);
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"), "Final"));
    pipelines.push(p);


    p = new ShaderPipeline();

    p.addShader(new TextureGBuffer(shaders.get("textureGBuffer"), canvas.width, canvas.height));
    p.addShader(new Skybox(shaders.get("skybox"), skybox, canvas.width, canvas.height));
    p.addShader(blinnPhongRenderer);
    p.addShader(new Fusion(shaders.get("fusion"), ["BlinnPhong", "Skybox"], "BlinnPhongAndSkybox", canvas.width, canvas.height));
    p.addShader(gammaCorrectionRenderer);
    
    let nb = 7.0;
    let w = canvas.width  / nb;
    let h = canvas.height / nb;
    let startH = canvas.height * (nb-1.0) / nb;
    p.addShader(new ApplyToScreen(shaders.get("applyToScreen"),    "Position",            w * 0.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreen"),    "Normal",              w * 1.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreen"),    "ColorSpecular",       w * 2.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenA"),   "ColorSpecular",       w * 3.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"), "Skybox",              w * 4.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"), "BlinnPhong",          w * 5.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"), "BlinnPhongAndSkybox", w * 6.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"), "Final"));
    pipelines.push(p);

    return pipelines;
}