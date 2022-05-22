let pipelines;

function buildPipelines() {
    pipelines = new Array();
    buildTestPipelines();
    buildDefaultPipelines();
}

function buildPBRPipelines(){}


function buildDefaultPipelines() {
    //==================================================================================================
    // SHADERS DATAs CONSTRUCTION BLINN PHONG ALL LIGHT
    //==================================================================================================
    //For blinn phong all lights
    let depthCameraAllLight = new Camera(vec3.clone([-1.0, 5.0, -2.0]), vec3.clone([0.0, 1.0, 0.0]), vec3.clone([0.0, 0.0, 0.0]));
    depthCameraAllLight.setOrthographic();
    depthCameraAllLight.setOrthographicSize(5.0);
    let depthMapResolution = 1024;
    let depthRendererAllLights = new DepthMap(shaders.get("depthMap"), depthCameraAllLight, depthMapResolution, depthMapResolution);

    let shadowRendererAllLights = new Shadow(shaders.get("shadowPCFautoBias"), canvas.width, canvas.height, true);
    shadowRendererAllLights.bias = 0.0;//0.00005;

    let chainRendererAllLights = new ChainRenderer([depthRendererAllLights, shadowRendererAllLights]);
    chainRendererAllLights.distanceFactor = 5.0;

    chainRendererAllLights.setRenderingFrom = function(position) {
        const distanceFactor = this.distanceFactor;
        let newCamPos = vec3.multiply([], position, [distanceFactor, distanceFactor, distanceFactor]);
        this.pipeline.shaderRenderers[0].camera.position = newCamPos;
    }

    createSeparateur("Rendering");
    let blinnPhongRenderer = new BlinnPhong(shaders.get("blinnPhongShadowSSAO"), canvas.width, canvas.height);
    let blinnPhongRendererAllLights = new BlinnPhongAllLight(shaders.get("blinnPhongShadowSSAOOneLight"), chainRendererAllLights, canvas.width, canvas.height);
    createValueSlider_UI("ambiant", blinnPhongRendererAllLights, "ambiant", 0.0, 1.0, 0.05);

    let exposureRenderer = new Exposure(shaders.get("exposure"), "AllinOne", "ExposedImage", canvas.width, canvas.height);
    createValueSlider_UI("exposure", exposureRenderer, "exposition", 0.0, 10.0, 0.1);

    let gammaCorrectionRenderer = new GammaCorrection(shaders.get("gammaCorrection"), "ExposedImage", "Final", canvas.width, canvas.height);
    createValueSlider_UI("gamma", gammaCorrectionRenderer, "gamma", 0.5, 5.0, 0.1);


    createSeparateur("Bloom");
    let canvasScale = 0.3;
    let extractRenderer = new ExtractColorByBrigthness(shaders.get("extractColorByBrigthness"), 0.95, vec4.clone([0.0, 0.0, 0.0, 1.0]), "Colors", "Extract", canvas.width * canvasScale, canvas.height * canvasScale);
    createValueSlider_UI("seuil", extractRenderer, "seuil", 0.0, 2.0, 0.05);

    let gaussianRenderer = new GaussianBlur(shaders.get("gaussianBlur"), 20.0, "Extract", "Bloom", canvas.width * canvasScale, canvas.height * canvasScale);
    createValueSlider_UI("nbPasses", gaussianRenderer, "passes", 0.0, 100.0, 2.0);

    let bloomSizeUpdater = {
        scaling : 0.3,
        onUiChange : function() {
            extractRenderer.framebuffer.update(canvas.width * this.scaling, canvas.height * this.scaling);
            gaussianRenderer.pingPongFramebuffers[0].update(canvas.width * this.scaling, canvas.height * this.scaling);
            gaussianRenderer.pingPongFramebuffers[1].update(canvas.width * this.scaling, canvas.height * this.scaling);
        }
    }
    createValue_UI("scaling", bloomSizeUpdater, "resolution scaling", 0.01);


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
    let uiHandler = {
        value : shadowRendererAllLights.bias,
        onUiChange : function() {
            shadowRenderer.bias = this.value;
            shadowRendererAllLights.bias = this.value;
        }
    }
    createValueSlider_UI("value", uiHandler, "bias", 0.0, 0.01, 0.00005);
    let depthCameraSizeUpdater = {
        size : 5.0,
        onUiChange : function() {
            depthCameraAllLight.setOrthographicSize(parseFloat(this.size));
            depthCamera.setOrthographicSize(parseFloat(this.size));
        }
    }
    createValueSlider_UI("size", depthCameraSizeUpdater, "map size", 1.0, 20.0, .1);

    createValueSlider_UI("distanceFactor", chainRendererAllLights, "distanceFactor", 0.0, 10.0, 0.1);

    //For the SSAO
    createSeparateur("SSAO");
    let ssao = new SSAO(shaders.get("ssao"), 32, 4, 4, canvas.width, canvas.height);
    createValueSlider_UI("kernelSize",     ssao, "number of samples", 1.0, 128.0, 1.0);
    createValueSlider_UI("radius",         ssao, "radius",            0.0, 1.0, 0.05);
    createValueSlider_UI("depthBias",      ssao, "depth bias",        0.0, .5, 0.001);
    createValueSlider_UI("angleBias",      ssao, "angle bias",        0.0, .5, 0.001);
    createValueSlider_UI("occlusionPower", ssao, "power",             0.0, 10.0, 0.1);

    let blurVal4 = 1.0 / 16.0;
    let blurKernel4 = new Float32Array([
        blurVal4, blurVal4, blurVal4, blurVal4,
        blurVal4, blurVal4, blurVal4, blurVal4,
        blurVal4, blurVal4, blurVal4, blurVal4,
        blurVal4, blurVal4, blurVal4, blurVal4
    ]);

    createSeparateur("PBR");
    let gShaderPBR = new PBRGBuffer(shaders.get("GBufferPBR"), canvas.width, canvas.height);
    createValueSlider_UI("ShaderAOCoef", gShaderPBR, "AO",             0.0, 1.0, 0.01);
    createValueSlider_UI("ShaderMetalCoef", gShaderPBR, "metalness",             0.0, 1.0, 0.01);
    createValueSlider_UI("ShaderRoughnessCoef", gShaderPBR, "roughness",             0.0, 1.0, 0.01);
    createVecN_UI("ShaderAlbedoCoef",  gShaderPBR, "albedo ",                 3, 0.01, true);


    //==================================================================================================
    // FIRST PIPELINE : FROM DIFFERED DATAs TO SCREEN RESULT
    //==================================================================================================
    let firstPipeline = new ShaderPipeline();
    //GPass
    firstPipeline.addShader(new TextureGBuffer(shaders.get("textureGBuffer"), canvas.width, canvas.height));
    firstPipeline.addShader(new GBuffer(shaders.get("GBuffer"), m=>m.reflective==true, "Reflexion", "Position", canvas.width, canvas.height));
    //Skybox
    firstPipeline.addShader(new Skybox(shaders.get("skybox"), skybox, "ReflexionPosition", canvas.width, canvas.height));
    //Reflexion
    firstPipeline.addShader(new CubeMapReflexion(shaders.get("cubemapReflexion"), skybox, canvas.width, canvas.height));
    //SSAO
    firstPipeline.addShader(ssao);
    firstPipeline.addShader(new Kernel(shaders.get("kernel4R"), blurKernel4, "SSAO", "SSAO", canvas.width, canvas.height));
    //Light and shadows : blinnPhongWithShadowsAllLights
    firstPipeline.addShader(blinnPhongRendererAllLights);
    //Fusion 1 : BlinnPhong avec la skybox
    firstPipeline.addShader(new FusionDepth(shaders.get("fusionDepth"), ["BlinnPhong", "Reflexion"], ["Position", "ReflexionPosition"], "BlinnPhongAndReflexion", canvas.width, canvas.height));
    firstPipeline.addShader(new Fusion(shaders.get("fusion"), ["BlinnPhongAndReflexion", "Skybox"], "Colors", canvas.width, canvas.height));
    //Bloom
    firstPipeline.addShader(extractRenderer);
    firstPipeline.addShader(gaussianRenderer);
    firstPipeline.addShader(new Fusion(shaders.get("fusion"), ["Colors", "Bloom"], "AllinOne", canvas.width, canvas.height));
    //Post effects
    firstPipeline.addShader(exposureRenderer);
    firstPipeline.addShader(gammaCorrectionRenderer);

    //Render
    firstPipeline.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"), "Final"));

    //Collider intersection
    firstPipeline.addShader(new ColliderShader(shaders.get("forwardCollider")));
    pipelines.push(firstPipeline);


    //==================================================================================================
    // DEFAULT PIPELINE STRUCTURE
    //==================================================================================================
    let defalutPipeline = new ShaderPipeline();

    //GPass
    defalutPipeline.addShader(new TextureGBuffer(shaders.get("textureGBuffer"), canvas.width, canvas.height));
    defalutPipeline.addShader(new GBuffer(shaders.get("GBuffer"), m=>m.reflective==true, "Reflexion", "Position", canvas.width, canvas.height));
    //Skybox
    defalutPipeline.addShader(new Skybox(shaders.get("skybox"), skybox, "ReflexionPosition", canvas.width, canvas.height));
    //Reflexion
    defalutPipeline.addShader(new CubeMapReflexion(shaders.get("cubemapReflexion"), skybox, canvas.width, canvas.height));
    //Shadow
    defalutPipeline.addShader(new DepthMap(shaders.get("depthMap"), depthCamera, 1024, 1024, true));
    defalutPipeline.addShader(shadowRenderer);
    //SSAO
    defalutPipeline.addShader(ssao);
    defalutPipeline.addShader(new Kernel(shaders.get("kernel4R"), blurKernel4, "SSAO", "SSAO", canvas.width, canvas.height));
    //Light : blinnPhongWithShadows
    defalutPipeline.addShader(blinnPhongRenderer);
    //Fusion 1 : BlinnPhong avec la skybox
    defalutPipeline.addShader(new FusionDepth(shaders.get("fusionDepth"), ["BlinnPhong", "Reflexion"], ["Position", "ReflexionPosition"], "BlinnPhongAndReflexion", canvas.width, canvas.height));
    defalutPipeline.addShader(new Fusion(shaders.get("fusion"), ["BlinnPhongAndReflexion", "Skybox"], "Colors", canvas.width, canvas.height));
    //Bloom
    defalutPipeline.addShader(extractRenderer);
    defalutPipeline.addShader(gaussianRenderer);
    //Fusion 2
    defalutPipeline.addShader(new Fusion(shaders.get("fusion"), ["Colors", "Bloom"], "AllinOne", canvas.width, canvas.height));
    //Post effects
    defalutPipeline.addShader(exposureRenderer);
    defalutPipeline.addShader(gammaCorrectionRenderer);


    //==================================================================================================
    // ADD A DEFAULT PIPELINE WITH A SCREEN RENDERING : ONE BLINNPHONG COMPUTATION
    //==================================================================================================
    let p = new ShaderPipeline();

    defalutPipeline.shaderRenderers.forEach(shaderRenderer => {
        p.addShader(shaderRenderer);
    });

    //Render
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"), "Final"));
    pipelines.push(p);



    //==================================================================================================
    // ADD A DEFAULT PIPELINE WITH ALL STEPS RENDERING
    //==================================================================================================
    //Same but with preview of the different steps
    p = new ShaderPipeline();

    defalutPipeline.shaderRenderers.forEach(shaderRenderer => {
        p.addShader(shaderRenderer);
    });

    //Render
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "Final"));
    let nb = 6.0;
    let w = canvas.width  / nb;
    let h = canvas.height / nb;
    //let startH = canvas.height * (nb-1.0) / nb;
    let startH = 0.0;
    p.addShader(new ApplyToScreen(shaders.get("applyToScreen"),     "Position",            w * 0.0, startH+2*h, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreen"),     "Normal",              w * 1.0, startH+2*h, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreen"),     "ColorSpecular",       w * 2.0, startH+2*h, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenA"),    "ColorSpecular",       w * 3.0, startH+2*h, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreen"),     "ReflexionPosition",   w * 4.0, startH+2*h, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreen"),     "ReflexionNormal",     w * 5.0, startH+2*h, w, h));
    
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "Skybox",              w * 0.0, startH+h, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRawR"), "DepthMap",            w * 1.0, startH+h, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRawR"), "Shadow",              w * 2.0, startH+h, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "SSAO",                w * 3.0, startH+h, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "BlinnPhong",          w * 4.0, startH+h, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreen"),     "Reflexion",           w * 5.0, startH+h, w, h));
    
    p.addShader(new ApplyToScreen(shaders.get("applyToScreen"),     "Colors",              w * 0.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "Extract",             w * 1.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "Bloom",               w * 2.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "AllinOne",            w * 3.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "ExposedImage",        w * 4.0, startH, w, h));
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "Final",               w * 5.0, startH, w, h));
    
    pipelines.push(p);

    //==================================================================================================
    // ADD A PBR PIPELINE FOR PHYSICALLY BASED RENDERING
    //==================================================================================================
    p = new ShaderPipeline();
    p.addShader(gShaderPBR);
    p.addShader(new PBRShader(shaders.get("PBR"),undefined, canvas.width, canvas.height));
    //Skybox
    p.addShader(new Skybox(shaders.get("skybox"), skybox, "Position", canvas.width, canvas.height));
    p.addShader(new Fusion(shaders.get("fusion"), ["PBR", "Skybox"], "Colors", canvas.width, canvas.height));
    //Bloom
    p.addShader(extractRenderer);
    p.addShader(gaussianRenderer);
    p.addShader(new Fusion(shaders.get("fusion"), ["Colors", "Bloom"], "AllinOne", canvas.width, canvas.height));
    //Post effects
    p.addShader(exposureRenderer);
    p.addShader(gammaCorrectionRenderer);
    p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"), "Final"));
    pipelines.push(p);

    return pipelines;
}

function buildTestPipelines() {
    let canvasScale = 0.5;
    let testCanvasScale = 1.0;

    // let p = new ShaderPipeline();

    // let g = new TextureGBuffer(shaders.get("textureGBuffer"), canvas.width, canvas.height)
    // let l = new BlinnPhong(shaders.get("blinnPhong"), canvas.width, canvas.height, false, false);

    // let chainRenderer = new ChainRenderer([g, l]);

    // chainRenderer.setFrameBuffer = function(fbo) {
    //     this.pipeline.shaderRenderers[1].framebuffer = fbo;
    // };

    // let cu = new RenderOnCubemap(shaders.get("applyToScreen"), chainRenderer, vec3.clone([0.0, 1.0, 0.0]), "BlinnPhong", "ReflexionMap", canvas.width, canvas.height);
    // // cu.cubemapTest = getCubeMapImage([
    // //     "data/img/skybox/right.jpg",
    // //     "data/img/skybox/left.jpg",
    // //     "data/img/skybox/top.jpg",
    // //     "data/img/skybox/bottom.jpg",
    // //     "data/img/skybox/front.jpg",
    // //     "data/img/skybox/back.jpg"
    // //     ]);
    // p.addShader(cu);

    // //p.addShader(new TextureGBuffer(shaders.get("textureGBuffer"), canvas.width, canvas.height));
    // p.addShader(new GBuffer(shaders.get("GBuffer"), m=>m.reflective==true, "Reflexion", undefined, canvas.width, canvas.height));
    

    // p.addShader(new ApplyCubeMapToObject(shaders.get("cubemapReflexion"), "ReflexionMap", canvas.width, canvas.height));

    // // p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "Reflexion"));
    // //p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "BlinnPhong"));
    // // p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "ReflexionPosition"));
    // //p.addShader(new Fusion(shaders.get("fusion"), ["Position", "ReflexionPosition"], "Pos", canvas.width, canvas.height));
    // //p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "Pos"));
    // p.addShader(new Fusion(shaders.get("fusion"), ["ReflexionPosition", "Reflexion"], "Refl", canvas.width, canvas.height));
    // p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "Refl"));
    // //p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "BlinnPhong"));
    // // p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "ReflexionMaptest"));
    // let nb = 6.0;
    // let w = canvas.width  / nb;
    // let h = canvas.height / nb;
    // for (let i = 0; i < 6; i++) {
    //     p.addShader(new ApplyToScreen(shaders.get("applyToScreenRaw"),  "InsideReflexionMap"+i, w*i, 0, w, h));
    // }

    // pipelines.push(p);

}