let scenes;

function pbr_test(){
    let scene = new Scene();
    let m;

    let nbX = 5;
    let nbY = 5;
    let spacingX = 1.5;
    let spacingY = 1.5;
    let startX = - (nbX-1) * spacingX * 0.5;
    let startY = - (nbY-1) * spacingY * 0.5;
    for (let x = 0; x < nbX; x++) {
        for (let y = 0; y < nbY; y++) {
            m = new Model(uvSphere());
            let posX = startX + x * spacingX;
            let posY = startY + y * spacingY;
            m.matrix.modelMatrix = mat4.clone(
                [
                    1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    posX, posY, 0, 1
                ]
            )
            m.diffuseTexture    = getTextureImage("data/img/chouette.png");
            m.specularTexture   = getTextureImage("data/img/white.png");
            m.specularFactor    = 2.0;
        
            m.collider = Sphere.fromObject(m.matrix.modelMatrix, m.modelData.vertexPositions);
            // m.material =  new Material(
            //     "data/img/pbr/rusted_iron/rustediron2_basecolor_small.png",
            //     "data/img/pbr/rusted_iron/rustediron2_normal_small.png",
            //     "data/img/pbr/rusted_iron/rustediron2_metallic_small.png",
            //     "data/img/pbr/rusted_iron/rustediron2_roughness_small.png"
            // );
            m.material =  new Material();
            m.material.coefAlbedo = vec3.clone([1.0, 0.3, 0.01]);
            m.material.coefMetal = x / nbX;
            m.material.coefRough = y / nbY;
            m.material.coefAO = 0.9;

            m.material.renderWithObjCoef = true;
            
            scene.addModel(m);
        }
    }

    goInsideSeparateur("PBR");
    let pbrWrap = {
        coefAO : scene.models[0].material.coefAO,
        onUiChange : function() {
            scene.models.forEach(m=>m.material.coefAO = this.coefAO);
        }
    }
    createValueSlider_UI("coefAO", pbrWrap, "Global AO", 0.0, 2.0, 0.05);

    nbX = 4;
    nbY = 4;
    spacingX = 5.0;
    spacingY = 5.0;
    startX = - (nbX-1) * spacingX * 0.5;
    startY = - (nbY-1) * spacingY * 0.5;
    for (let x = 0; x < nbX; x++) {
        for (let y = 0; y < nbY; y++) {
            let posX = startX + x * spacingX;
            let posY = startY + y * spacingY;
            let l = new Light([posX, posY, 10.0], [1.0, 1.0, 1.0], 0.2, 0.01);
            scene.addLight(l);

            createModelColliderForLight(l, scene);
        }
    }

    scene.pipelines.push(pipelines[3]);
    scene.pipelines.push(pipelines[4]);
    scenes.push(scene);
}

function createModelColliderForLight(light, scene) {
    let lightScale = 0.3;

    m = new Model(uvSphere());
    m.matrix.modelMatrix = mat4.clone(
        [lightScale, 0, 0, 0,
        0, lightScale, 0, 0,
        0, 0, lightScale, 0,
        light.position[0], light.position[1], light.position[2], 1]
    )
    m.diffuseTexture = getTextureImage("data/img/white.png");
    m.diffuseFactorValue = 10.0 - 4.0 * light.linear - 8.0 * light.quadratic;
    m.diffuseFactor = vec3.multiply([], light.color, [m.diffuseFactorValue, m.diffuseFactorValue, m.diffuseFactorValue]);
    m.specularTexture = getTextureImage("data/img/white.png");
    m.specularFactor = 0.0;

    m.material =  new Material();
    m.material.coefAlbedo = m.diffuseFactor;
    m.material.renderWithObjCoef = true;

    m.invisibleDepth = true;

    m.collider = new Sphere(vec3.clone([0.0, 0.0, 0.0]), lightScale * 2.0);
    m.attachedLight = light;
    m.update = function() {
        this.attachedLight.position = vec3.clone([this.matrix.modelMatrix[12], this.matrix.modelMatrix[13], this.matrix.modelMatrix[14]]);
        this.diffuseFactorValue = 10.0 - 4.0 * this.attachedLight.linear - 8.0 * this.attachedLight.quadratic;
        this.diffuseFactor = vec3.multiply([], this.attachedLight.color, [this.diffuseFactorValue, this.diffuseFactorValue, this.diffuseFactorValue]);
        this.material.coefAlbedo = this.diffuseFactor;

        this.masterUpdate();
    }
    scene.addModel(m);
}

function buildScenes() {
    scenes = new Array();


    pbr_test();

    //MAJ de l'avancée du chargement
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
    m.specularFactor = 1.0;
    
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

    goInsideSeparateur("Rendering");
    createVecN_UI("diffuseFactor", m, "diffuse", 3, 0.1, true);
    createValueSlider_UI("specularFactor", m, "specular", 0.0, 6.0, 0.05);
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
    

    createButton_UI(e=>{
        if (scenes[currentScene].lights.length < 16) {
            let lightId = scenes[currentScene].lights.length;
            let l = new Light([0.0, 5.0, -5.0],  [1.0, 1.0, 1.0], 0.4, 0.1);
            scenes[currentScene].addLight(l);
            createModelColliderForLight(l, scenes[currentScene]);

            createSeparateurInside("Light number " + lightId, "h3");

            let lightsUiHandler = {
                index : lightId,
    
                color :     scenes[currentScene].lights[lightId].color,
                linear :    scenes[currentScene].lights[lightId].linear,
                quadratic : scenes[currentScene].lights[lightId].quadratic,
    
                onUiChange : function() {
                    if (scenes[currentScene].lights[this.index] != undefined) {
                        scenes[currentScene].lights[this.index].color     = this.color;
                        scenes[currentScene].lights[this.index].linear    = this.linear;
                        scenes[currentScene].lights[this.index].quadratic = this.quadratic;
                    }
                }
            }
            createVecN_UI("color",      lightsUiHandler, "Color ",                 3, undefined, true);
            createValue_UI("linear",    lightsUiHandler, "Linear attenuation ",    0.1);
            createValue_UI("quadratic", lightsUiHandler, "Quadratic attenuation ", 0.05);
            endSeparateur();
        }
    }, "Add light")


    for (let i = 0; i < lights.length; i++) {
        createModelColliderForLight(lights[i], scene);

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
    scene.pipelines.push(pipelines[0]);
    scene.pipelines.push(pipelines[1]);
    scene.pipelines.push(pipelines[2]);

    scenes.push(scene);


    //=================================================================
    //                       Scene gamma correction
    //=================================================================
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