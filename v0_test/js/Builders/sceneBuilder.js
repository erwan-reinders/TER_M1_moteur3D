let scenes;

function testScene() {
    scene = new Scene("webglcanvas");

    let m;

    //Texture
    m = new Model(cube(), "textureGBuffer");
    m.matrix.modelMatrix = mat4.clone(
        [1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, -2, 1]
    )
    m.diffuseTexture = getTextureImage("data/img/chouette.png");
    m.specularTexture = getTextureImage("data/img/baboon.png");
    m.specularFactor = 16.0;
    scene.addModel(m);


    //YELLOW
    m = new Model(uvSphere(), "textureGBuffer");
    m.matrix.modelMatrix = mat4.clone(
        [1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        -2, 0, 0, 1]
    )
    m.diffuseTexture = getTextureImage("data/img/white.png");
    m.diffuseFactor = vec3.clone([0.76, 0.69, 0.48]);
    m.specularTexture = getTextureImage("data/img/white.png");
    scene.addModel(m);

    //MAGENTA
    m = new Model(uvTorus(), "textureGBuffer");
    m.matrix.modelMatrix = mat4.clone(
        [1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        2, 0, 0, 1]
    )
    m.diffuseTexture = getTextureImage("data/img/white.png");
    m.diffuseFactor = vec3.clone([0.76, 0.48, 0.69]);
    m.specularTexture = getTextureImage("data/img/white.png");
    scene.addModel(m);


    //SOL
    m = new Model(cube(), "textureGBuffer");
    m.matrix.modelMatrix = mat4.clone(
        [100, 0, 0, 0,
        0, 0.01, 0, 0,
        0, 0, 100, 0,
        0, -1, 0, 1]
    )
    m.diffuseTexture = getTextureImage("data/img/white.png");
    m.diffuseFactor = vec3.clone([0.48, 0.76, 0.76]);
    m.specularTexture = getTextureImage("data/img/white.png");
    scene.addModel(m);

    scene.addModel(new Model(quad(), "lightBlinnPhong"));

    m = new Model(quad(), "postEffectGammaCorrection");
    m.gamma = 2.2;
    createValueSlider_UI("gamma", m, "gamma correction", 0.0, 5.0, 0.1);
    scene.addModel(m);

    scene.addModel(new Model(quad(), "end"));
    
    scene.initModels();



    scene.addLight(new Light());
    scene.addLight(new Light(vec3.clone([-5.0, 5.0, -5.0]), vec3.clone([0.9, 0.7, 0.3]), 0.4, 0.1));

    return scene;
}

function skyboxScene() {
    scene = new Scene("webglcanvas");

    //YELLOW
    m = new Model(cube(), "textureGBuffer");
    m.matrix.modelMatrix = mat4.clone(
        [1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1]
    )
    m.diffuseTexture = getTextureImage("data/img/white.png");
    m.diffuseFactor = vec3.clone([0.76, 0.69, 0.48]);
    m.specularTexture = getTextureImage("data/img/white.png");
    scene.addModel(m);


    let c = getCubeMapImage([
        "data/img/baboon256.png",
        "data/img/chouette256.png",
        "data/img/baboon256.png",
        "data/img/chouette256.png",
        "data/img/chouette256.png",
        "data/img/chouette256.png"]);
    m = new Model(quad(), "cubeMapReflexion");
    m.cubemap = c;
    scene.addModel(m);
    
    m = new Model(cube(), "skybox");
    m.cubemap = c;
    scene.addModel(m);

    m = new Model(quad(), "fusion");
    m.texture0 = shaders.get("skybox");
    m.texture1 = shaders.get("cubeMapReflexion");
    scene.addModel(m);

    scene.addModel(new Model(quad(), "end"));


    scene.addLight(new Light());

    return scene;
}

function reflexion() {
    scene = new Scene("webglcanvas");

    let c = getCubeMapImage([
        "data/img/skybox/right.jpg",
        "data/img/skybox/left.jpg",
        "data/img/skybox/top.jpg",
        "data/img/skybox/bottom.jpg",
        "data/img/skybox/front.jpg",
        "data/img/skybox/back.jpg"
        ]);

    m = new Model(cube(), "cubeMapReflexionSOLO");
    m.cubemap = c;
    scene.addModel(m);
    
    m = new Model(cube(), "cubeMapRefractionSOLO");
    m.matrix.modelMatrix = mat4.clone(
        [1, 0, 0, 0,
        0, 2, 0, 0,
        0, 0, 1, 0,
        2, 0, 0, 1]
    )
    m.cubemap = c;
    m.ratio = 0.75;
    createValueSlider_UI("ratio", m, "refraction ratio", 0.0, 2.0, 0.01);
    scene.addModel(m);

    m = new Model(cube(), "skybox");
    m.cubemap = c;
    scene.addModel(m);

    m = new Model(quad(), "fusion3");
    m.texture0 = shaders.get("cubeMapReflexionSOLO");
    m.texture1 = shaders.get("cubeMapRefractionSOLO");
    m.texture2 = shaders.get("skybox");
    scene.addModel(m);

    m = new Model(quad(), "postEffectGammaCorrection");
    m.gamma = 2.2;
    scene.addModel(m);

    scene.addModel(new Model(quad(), "end"));

    return scene;
}

function buildScenes() {
    scenes = new Array();

    let scene = new Scene();

    let m;
    
    //Texture
    m = new Model(cube());
    m.matrix.modelMatrix = mat4.clone(
        [1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, -2, 1]
    )
    m.diffuseTexture = getTextureImage("data/img/chouette.png");
    m.specularTexture = getTextureImage("data/img/baboon.png");
    m.specularFactor = 16.0;
    scene.addModel(m);


    //YELLOW
    m = new Model(uvSphere());
    m.matrix.modelMatrix = mat4.clone(
        [1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        -2, 0, 0, 1]
    )
    m.diffuseTexture = getTextureImage("data/img/white.png");
    m.diffuseFactor = vec3.clone([0.76, 0.69, 0.48]);
    m.specularTexture = getTextureImage("data/img/white.png");
    scene.addModel(m);

    //MAGENTA
    m = new Model(uvTorus());
    m.matrix.modelMatrix = mat4.clone(
        [1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        2, 0, 0, 1]
    )
    m.diffuseTexture = getTextureImage("data/img/white.png");
    m.diffuseFactor = vec3.clone([0.76, 0.48, 0.69]);
    m.specularTexture = getTextureImage("data/img/white.png");
    scene.addModel(m);


    //SOL
    m = new Model(cube());
    m.matrix.modelMatrix = mat4.clone(
        [100, 0, 0, 0,
        0, 0.01, 0, 0,
        0, 0, 100, 0,
        0, -1, 0, 1]
    )
    m.diffuseTexture = getTextureImage("data/img/white.png");
    m.diffuseFactor = vec3.clone([0.48, 0.76, 0.76]);
    m.specularTexture = getTextureImage("data/img/white.png");
    scene.addModel(m);


    
    scene.addLight(new Light());
    scene.addLight(new Light(vec3.clone([-5.0, 5.0, -5.0]), vec3.clone([0.9, 0.7, 0.3]), 0.4, 0.1));

    scenes.push(scene);
    

    return scenes;
}