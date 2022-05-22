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

function testCubemap() {
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

    m = new Model(quad(), "postEffectGammaCorrection");
    m.gamma = 2.2;
    scene.addModel(m);

    scene.addModel(new Model(quad(), "end"));

    return scene;
}

function testCubemap2() {
    scene = new Scene("webglcanvas");

    let c = getCubeMapImage([
        "data/img/skybox/right.jpg",
        "data/img/skybox/left.jpg",
        "data/img/skybox/top.jpg",
        "data/img/skybox/bottom.jpg",
        "data/img/skybox/front.jpg",
        "data/img/skybox/back.jpg"
        ]);

    m = new Model(cube(), "textureGBuffer");
    m.diffuseTexture = getTextureImage("data/img/white.png");
    m.specularTexture = getTextureImage("data/img/white.png");
    scene.addModel(m);

    m = new Model(quad(), "cubeMapReflexion");
    m.cubemap = c;
    scene.addModel(m);

    m = new Model(quad(), "postEffectGammaCorrection");
    m.gamma = 2.2;
    scene.addModel(m);

    scene.addModel(new Model(quad(), "end"));

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

    m = new Model(uvTorus(), "cubeMapReflexionSOLO");
    m.cubemap = c;
    scene.addModel(m);

    m = new Model(uvSphere(), "cubeMapRefractionSOLO");
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

function pbr_test(){
    let scene = new Scene();
    let m;

    //Texture
    m = new Model(cube());
    m.matrix.modelMatrix = mat4.clone(
        [   2, 0, 0, 0,
            0, 2, 0, 0,
            0, 0, 2, 0,
            0, 0, -2, 1
        ]
    )
    m.diffuseTexture    = getTextureImage("data/img/chouette.png");
    m.specularTexture   = getTextureImage("data/img/white.png");
    m.specularFactor    = 16.0;

    m.collider = AABB.fromObject(m.matrix.modelMatrix, m.modelData.vertexPositions);
    m.material =  new Material();

    //m.collider = Sphere.fromObject(m.matrix.modelMatrix, m.modelData.vertexPositions);
    //m.collider = OBB.fromObject(m.matrix.modelMatrix, m.modelData.vertexPositions);
    scene.addModel(m);

    scene.addLight(new Light([-10.0, 50.0, -20.0], [1.0, 1.0, 1.0], 0.01, 0.001));

    pipelines.forEach(p=>scene.pipelines.push(p));
    scenes.push(scene);
}

function buildScenes() {
    scenes = new Array();

    pbr_test();

    //MAJ avancé chargement
    setLoadingPercent(0.4);


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

    m.collider = AABB.fromObject(m.matrix.modelMatrix, m.modelData.vertexPositions);

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
    let factor = 2.0;
    m.diffuseFactor = vec3.multiply([], [0.76, 0.69, 0.48], [factor, factor, factor]);
    m.specularTexture = getTextureImage("data/img/white.png");
    m.specularFactor = 4.0;

    m.collider = Sphere.fromObject(m.matrix.modelMatrix, m.modelData.vertexPositions);

    scene.addModel(m);

    //MAGENTA
    m = new Model(uvTorus());
    m.matrix.modelMatrix = mat4.clone(
        [1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        2, -0.4, 0, 1]
    )
    m.diffuseTexture = getTextureImage("data/img/white.png");
    m.diffuseFactor = vec3.clone([0.76, 0.48, 0.69]);
    m.specularTexture = getTextureImage("data/img/white.png");
    
    m.rotationAzimuth = 0.0;
    m.rotationZenith = 0.0;
    m.update = function() {
        this.rotationAzimuth += 0.01;
        this.rotationZenith  += 0.01;
        let x = Math.cos(this.rotationAzimuth) * Math.cos(this.rotationZenith);
        let y = Math.sin(this.rotationZenith );
        let z = Math.sin(this.rotationAzimuth) * Math.cos(this.rotationZenith);
        mat4.rotate(this.matrix.modelMatrix, this.matrix.modelMatrix, 0.02, [x, y, z]);

        this.masterUpdate();
    }
    m.collider = AABB.fromObject(m.matrix.modelMatrix, m.modelData.vertexPositions);
    scene.addModel(m);


    //TEA POT
    m = new Model(teapotModel);
    let teaPotScale = 0.05;
    m.matrix.modelMatrix = mat4.clone(
        [teaPotScale, 0, 0, 0,
        0, teaPotScale, 0, 0,
        0, 0, teaPotScale, 0,
        0, -0.6, 0, 1]
    )
    m.diffuseTexture = getTextureImage("data/img/white.png");
    m.diffuseFactor = vec3.clone([1.0, 1.0, 1.0]);
    m.specularTexture = getTextureImage("data/img/white.png");
    m.specularFactor = 3.0;

    //m.collider = m.collider = AABB.fromObject(m.matrix.modelMatrix, m.modelData.vertexPositions);
    m.collider = Sphere.fromObject(m.matrix.modelMatrix, m.modelData.vertexPositions);

    m.invisible = true;
    m.reflective = true;

    scene.addModel(m);


    //SOL
    m = new Model(cube());
    let solScale = 20;
    m.matrix.modelMatrix = mat4.clone(
        [solScale, 0, 0, 0,
        0, 1.0, 0, 0,
        0, 0, solScale, 0,
        0, -1.5, 0, 1]
    )
    m.diffuseTexture = getTextureImage("data/img/white.png");
    m.diffuseFactor = vec3.clone([0.48, 0.76, 0.76]);
    m.specularTexture = getTextureImage("data/img/white.png");
    m.specularFactor = 0.5;
    scene.addModel(m);


    let lights = [
        new Light([ 2.0,  3.0,   1.0],  [0.3, 0.7, 0.9]),
        new Light([-5.0,  5.0,  -2.0],  [0.9, 0.7, 0.3], 0.4, 0.1),
        new Light([-10.0, 10.0, -10.0], [1.0, 1.0, 1.0], 0.04, 0.004)
    ]
    createSeparateur("Lights");
    let lightScale = 0.3;
    for (let i = 0; i < lights.length; i++) {
        m = new Model(uvSphere());
        m.matrix.modelMatrix = mat4.clone(
            [lightScale, 0, 0, 0,
            0, lightScale, 0, 0,
            0, 0, lightScale, 0,
            lights[i].position[0], lights[i].position[1], lights[i].position[2], 1]
        )
        m.diffuseTexture = getTextureImage("data/img/white.png");
        m.diffuseFactorValue = 10.0 - 4.0 * lights[i].linear - 8.0 * lights[i].quadratic;
        m.diffuseFactor = vec3.multiply([], lights[i].color, [m.diffuseFactorValue, m.diffuseFactorValue, m.diffuseFactorValue]);
        m.specularTexture = getTextureImage("data/img/white.png");
        m.specularFactor = 0.0;
        m.invisibleDepth = true;
        //m.collider = AABB.fromObject(m.matrix.modelMatrix, m.modelData.vertexPositions);
        //m.collider = Sphere.fromObject(m.matrix.modelMatrix, m.modelData.vertexPositions);
        m.collider = new Sphere(vec3.clone([0.0, 0.0, 0.0]), lightScale * 2.0);
        m.attachedLight = lights[i];
        m.update = function() {
            this.attachedLight.position = vec3.clone([this.matrix.modelMatrix[12], this.matrix.modelMatrix[13], this.matrix.modelMatrix[14]]);
            this.diffuseFactorValue = 10.0 - 4.0 * this.attachedLight.linear - 8.0 * this.attachedLight.quadratic;
            this.diffuseFactor = vec3.multiply([], this.attachedLight.color, [this.diffuseFactorValue, this.diffuseFactorValue, this.diffuseFactorValue]);

            this.masterUpdate();
        }
        scene.addModel(m);

        createSeparateurInside("Light number " + i, "h3");

        let lightsUiHandler = {
            index : i,

            color :     lights[i].color,
            linear :    lights[i].linear,
            quadratic : lights[i].quadratic,

            onUiChange : function() {
                lights[this.index].color     = this.color;
                lights[this.index].linear    = this.linear;
                lights[this.index].quadratic = this.quadratic;
            }
        }
        createVecN_UI("color",      lightsUiHandler, "Color ",                 3, undefined, true);
        createValue_UI("linear",    lightsUiHandler, "Linear attenuation ", 0.1);
        createValue_UI("quadratic", lightsUiHandler, "Quadratic attenuation ", 0.05);
        endSeparateur();
    }
    lights.forEach(l => scene.addLight(l));


    pipelines.forEach(p=>scene.pipelines.push(p));

    scenes.push(scene);

    //MAJ avancé chargement
    setLoadingPercent(0.6);

    scene = new Scene();

    for (let i = 0; i < 11; i++) {
        m = new Model(cube());
        m.matrix.modelMatrix = mat4.clone(
            [1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            (i-5.0) * 1.5, 0.75, 0, 1]
        )
        m.diffuseTexture = getTextureImage("data/img/white.png");
        let factor = i / 11.0;
        m.diffuseFactor = vec3.clone([factor, factor, factor]);
        m.specularTexture = getTextureImage("data/img/white.png");
        m.specularFactor = 0.0;
        scene.addModel(m);

        m = new Model(cube());
        m.matrix.modelMatrix = mat4.clone(
            [1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            (i-5.0) * 1.5, -0.75, 0, 1]
        )
        m.diffuseTexture = getTextureImage("data/img/white.png");
        factor = Math.pow(i / 11.0, 1.0/2.2);
        m.diffuseFactor = vec3.clone([factor, factor, factor]);
        m.specularTexture = getTextureImage("data/img/white.png");
        m.specularFactor = 0.0;
        scene.addModel(m);
    }

    scene.addLight(new Light([-10.0, 50.0, -20.0], [1.0, 1.0, 1.0], 0.01, 0.001));

    scene.pipelines.push(pipelines[0]);

    scenes.push(scene);

    return scenes;
}