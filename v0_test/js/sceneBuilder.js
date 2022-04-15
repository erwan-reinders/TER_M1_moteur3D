function testScene(scene) {
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
    m.diffuseFactor = vec3.clone([3.0, 3.0, 3.0]);
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
    m.diffuseTexture = getTextureImage("data/img/yellow.png");
    m.diffuseFactor = vec3.clone([2.0, 2.0, 2.0])
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
    m.diffuseTexture = getTextureImage("data/img/magenta.png");
    m.diffuseFactor = vec3.clone([2.0, 2.0, 2.0]);
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
    m.diffuseTexture = getTextureImage("data/img/blue.png");
    m.diffuseFactor = vec3.clone([2.0, 2.0, 2.0]);
    m.specularTexture = getTextureImage("data/img/white.png");
    scene.addModel(m);

    scene.addModel(new Model(quad(), "lightBlinnPhong"));
    
    scene.initModels();



    scene.addLight(new Light());
    scene.addLight(new Light(vec3.clone([-5.0, 5.0, -5.0]), vec3.clone([0.9, 0.7, 0.3]), 0.4, 0.1));

    return scene;
}