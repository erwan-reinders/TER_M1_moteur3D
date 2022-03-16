/*Classe modélisant la texture de base du TD comme extension de la texture*/

/*Constructeur d'une texture_normale
    * @param gl : Objet représentant le contexte de dessin WEBGL du canvas de rendu
    * @param vertexSH : ID_HTMLVertexShader de notre texture
    * @param fragmentSH : ID_HTMLFragmentShader de notre texture*/
function Texture_normale(gl,vertexSH_id,fragmentSH_id) {
    //console.log(" ==== JE CONSTRUIT UNE TEXTURE_NORMALE A PARTIR DE");
    //console.log(gl);
    //console.log(vertexSH_id);
    //console.log(fragmentSH_id);

    Texture.call(this,gl,vertexSH_id,fragmentSH_id);
    //console.log("CONSTRUCTION DU PROGRAMME");
    this.createProgram();

    //objet renseignant les informations des formes à dessiner
    this.forme = {
        diametre : .3,
    }

    this.nombre_disque = 20;
    //console.log("GL DE TEXTURE NORM");
    //console.log(gl);
    //console.log(this.gl);
    //console.log(this);
    //console.log(" ==== FIN DE CONSTRUCTION");
}

Texture_normale.prototype = Object.create(Texture.prototype);
Texture_normale.prototype.constructor = Texture_normale;

Texture_normale.prototype.init = function (){
    //Récupération des différents éléments des shaders
    this.gl.useProgram(this.prog);
    this.a_coords_loc_texture =  this.gl.getAttribLocation(this.prog, "a_coords");
    this.u_translation_texture = this.gl.getUniformLocation(this.prog, "translation");
    this.u_color_texture = this.gl.getUniformLocation(this.prog, "color");
    //console.log("TOUT VA BIEN INIT MODEL");

    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 512, 512, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);

    this.framebuffer = this.gl.createFramebuffer();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.framebuffer);
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.texture, 0);

    if (this.gl.getError() != this.gl.NO_ERROR) {
        console.log(this.gl.getError());
        throw "Some WebGL error occurred while trying to create framebuffer.";
    }

    this.init_data();
}

Texture_normale.prototype.init_data = function () {
    console.log("J'INITIALISE LA TEXTURE NORMALE");
    this.diskCenters = new Array(this.nombre_disque);
    this.diskColors = new Array(this.nombre_disque);
    this.diskVelocities = new Array(this.nombre_disque);
    for (let i = 0; i < this.nombre_disque; i++) {
        this.diskColors[i] = [ Math.random(), Math.random(), Math.random(), 0.5 ];
        this.diskCenters[i] = [ 2*Math.random() - 1, 2*Math.random() - 1 ];
        let angle = Math.random()*2*Math.PI;
        let speed = 0.003 + 0.01*Math.random();
        this.diskVelocities[i] = [ speed*Math.cos(angle), speed*Math.sin(angle) ];
    }

    let diskCoords = new Float32Array(2*64);
    for (let i = 0; i < 64; i++) {
        let angle = i/64 * 2*Math.PI;
        diskCoords[2*i] = this.forme.diametre/2 * Math.cos(angle);
        diskCoords[2*i+1] = this.forme.diametre/2 * Math.sin(angle);
    }
    this.buffer_texture = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer_texture);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, diskCoords, this.gl.STATIC_DRAW);
}

Texture_normale.prototype.rendre = function (){
    let obj = this;
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.framebuffer);
    this.gl.useProgram(this.prog);

    this.gl.clearColor(1,1,1,1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.viewport(0,0,512,512);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ZERO, this.gl.ONE);
    this.gl.lineWidth(2);
    this.gl.enableVertexAttribArray(this.a_coords_loc_texture);

    //ON VA DESSINER LA TEXTURE DE BASE (CERCLES)
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer_texture);
    this.gl.vertexAttribPointer(this.a_coords_loc_texture, 2, this.gl.FLOAT, false, 0, 0);

    //DRAWDISK
    let DISK_DIAMETER = this.forme.diametre;
    let DISK_COUNT = this.nombre_disque;

    function disk(i, extraTranslateX, extraTranslateY) {
        //console.log(obj);
        obj.gl.uniform4fv(obj.u_color_texture, obj.diskColors[i]);
        obj.gl.uniform2f(obj.u_translation_texture, obj.diskCenters[i][0] + extraTranslateX, obj.diskCenters[i][1] + extraTranslateY);
        obj.gl.drawArrays(obj.gl.TRIANGLE_FAN, 0, 64);
        obj.gl.uniform4f(obj.u_color_texture, 0, 0, 0, 1);
        obj.gl.drawArrays(obj.gl.LINE_LOOP, 0, 64);
        //console.log("TOUT VA BIEN DISK TXTNORM");
    }
    let r = DISK_DIAMETER/2;
    for (let i = 0; i < DISK_COUNT; i++) {
        disk(i,0,0);
        if (this.diskCenters[i][0] < -1 + r) {
            disk(i,2,0);
            disk(i,2,2);
            disk(i,2,-2);
        }
        if (this.diskCenters[i][0] > 1 - r) {
            disk(i,-2,0);
            disk(i,-2,2);
            disk(i,-2,-2);
        }
        if (this.diskCenters[i][1] < -1 + r) {
            disk(i,0,2);
        }
        if (this.diskCenters[i][1] > 1 - r) {
            disk(i,0,-2);
        }
    }

    this.gl.disableVertexAttribArray(this.a_coords_loc_texture);
    this.gl.disable(this.gl.BLEND);
}

Texture_normale.prototype.update = function (){
    let DISK_COUNT = this.nombre_disque;

    for (let i = 0; i < DISK_COUNT; i++) {
        this.diskCenters[i][0] += this.diskVelocities[i][0];
        if (this.diskCenters[i][0] < -1) {
            this.diskCenters[i][0] += 2;
        }
        else if (this.diskCenters[i][0] > 1) {
            this.diskCenters[i][0] -=2;
        }
        this.diskCenters[i][1] += this.diskVelocities[i][1];
        if (this.diskCenters[i][1] < -1) {
            this.diskCenters[i][1] += 2;
        }
        else if (this.diskCenters[i][1] > 1) {
            this.diskCenters[i][1] -=2;
        }
        if (Math.random() < 0.02) {
            let angle = Math.random()*2*Math.PI;
            let speed = 0.003 + 0.01*Math.random();
            this.diskVelocities[i] = [ speed*Math.cos(angle), speed*Math.sin(angle) ];
        }
    }
}

