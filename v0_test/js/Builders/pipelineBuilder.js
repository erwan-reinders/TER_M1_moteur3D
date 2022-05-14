let pipelines;


function buildPipelines() {
    pipelines = new Array();

    let p;

    let blinnPhongRenderer = new BlinnPhong(shaders.get("blinnPhong"), canvas.width, canvas.height);
    createValueSlider_UI("ambiant", blinnPhongRenderer, "ambiant", 0.0, 1.0, 0.05);

    let gammaCorrectionRenderer = new GammaCorrection(shaders.get("gammaCorrection"), "BlinnPhong", "BlinnPhongCorrected", canvas.width, canvas.height);
    createValueSlider_UI("gamma", gammaCorrectionRenderer, "gamma", 0.5, 5.0, 0.1);
    
    

    p = new ShaderPipeline();

    p.addShader(new TextureGBuffer(shaders.get("textureGBuffer"), canvas.width, canvas.height));
    p.addShader(blinnPhongRenderer);
    p.addShader(gammaCorrectionRenderer);
    p.addShader(new ApplyToScreen(shaders.get("applyToScreen"), "BlinnPhongCorrected"));
    pipelines.push(p);


    p = new ShaderPipeline();

    p.addShader(new TextureGBuffer(shaders.get("textureGBuffer"), canvas.width, canvas.height));
    p.addShader(blinnPhongRenderer);
    p.addShader(gammaCorrectionRenderer);
    
    let nb = 5.0;
    let w = canvas.width  / nb;
    let h = canvas.height / nb;
    let startH = canvas.height * (nb-1.0) / nb;
    p.addShader(new ApplyToScreen(shaders.get("applyToScreen"),  "Position",      w * 0.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreen"),  "Normal",        w * 1.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreen"),  "ColorSpecular", w * 2.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenA"), "ColorSpecular", w * 3.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreen"),  "BlinnPhong",    w * 4.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreen"),  "BlinnPhongCorrected"));
    pipelines.push(p);

    return pipelines;
}