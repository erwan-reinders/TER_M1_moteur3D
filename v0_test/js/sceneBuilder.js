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
    m = new Model(cube(), "textureGBuffer");
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
    m = new Model(cube(), "textureGBuffer");
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
        -2, 0, 0, 1]
    )
    m.diffuseTexture = getTextureImage("data/img/white.png");
    m.diffuseFactor = vec3.clone([0.76, 0.69, 0.48]);
    m.specularTexture = getTextureImage("data/img/white.png");
    scene.addModel(m);

    scene.addModel(new Model(quad(), "lightBlinnPhong"));
    
    m = new Model(cube(), "skybox");
    m.cubemap = getCubeMapImage([
        "data/img/chouette.png",
        "data/img/chouette.png",
        "data/img/chouette.png",
        "data/img/chouette.png",
        "data/img/chouette.png",
        "data/img/chouette.png"]);
    scene.addModel(m);

    m = new Model(quad(), "fusion");
    m.texture0 = shaders.get("skybox");
    m.texture1 = shaders.get("lightBlinnPhong");
    scene.addModel(m);


    m = new Model(quad(), "postEffectGammaCorrection");
    m.gamma = 2.2;
    scene.addModel(m);

    scene.addModel(new Model(quad(), "end"));


    scene.addLight(new Light());

    return scene;
}