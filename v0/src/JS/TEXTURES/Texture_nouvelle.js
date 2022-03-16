/*Classe modélisant la Texture simple ayant qu'un seul type de forme pour une seule vélocité et une seule couleur*/

/*Constructeur d'une texture_nouvelle
    * @param gl : Objet représentant le contexte de dessin WEBGL du canvas de rendu
    * @param vertexSH : ID_HTMLVertexShader de notre texture
    * @param fragmentSH : ID_HTMLFragmentShader de notre texture*/
function Texture_nouvelle(gl,vertexSH_id,fragmentSH_id) {
    Texture.call(this,gl,vertexSH_id,fragmentSH_id);
    this.createProgram();

    // ======== Paramètres de modifications visuelles de la texture
    //largeur
    this.width_text = 512;
    //hauteur
    this.height_text = 512;

    //Objet représentant la/les formes de la texture
    this.forme = {
        //Vitesse de déplacement des formes de la texture
        vitesse : .01,
        //Valeur de taille des formes des textures
        taille : [.3,.3],
        //Deplacement de chacun des elements de la texture
        deplacement : [1,1],
        //Couleur des éléments de la texture (rouge par défaut)
        couleur : [1, 0, 0, 1],
        //Centre de la forme composant la texture
        centre : [0, 0],
        //Liste des sommets composants la forme
        tab_coord : [],
        //angle de direction
        angle : 1/9,
        //Nombre de triangles (dessin)
        nombre_triangles : 0,
    };
}

Texture_nouvelle.prototype = Object.create(Texture.prototype);
Texture_nouvelle.prototype.constructor = Texture_nouvelle;

Texture_nouvelle.prototype.init = function (){
    //Récupération des différents éléments des shaders
    this.gl.useProgram(this.prog);
    this.a_coords_loc_texture =  this.gl.getAttribLocation(this.prog, "a_coords");
    this.u_translation_texture = this.gl.getUniformLocation(this.prog, "translation");
    this.u_color_texture = this.gl.getUniformLocation(this.prog, "color");

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

Texture_nouvelle.prototype.init_data = function () {
    /*console.log("J'INITIALISE LA TEXTURE NORMALE");
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
    this.gl.bufferData(this.gl.ARRAY_BUFFER, diskCoords, this.gl.STATIC_DRAW);*/

    let rectangle = function (tab,xDeb, yDeb, vect1, vect2){
        tab.push(
            xDeb,yDeb,
            xDeb+vect1[0], yDeb+vect1[1],
            xDeb+vect2[0], yDeb+vect2[1],
            xDeb+vect2[0], yDeb+vect2[1],
            xDeb+vect1[0], yDeb+vect1[1],
            xDeb+vect1[0]+vect2[0], yDeb+vect1[1]+vect2[1],
        );
        return 6;
    };
    let lettre_D = function (tab,xDeb,yDeb,hauteur,largeur,italique){
        let espacement = 1/16*hauteur;
        let largeur_pol = 1/4*largeur;
        let hauteur_pol = 1/4*hauteur;
        return rectangle(tab,xDeb+italique-largeur_pol,yDeb+hauteur,[-italique/2,-1/4*hauteur],[(2/3)*largeur+italique-largeur_pol,0])
            + rectangle(tab,xDeb+italique+(2*largeur/3)-largeur_pol,yDeb+hauteur,[-italique/2,-1/4*hauteur],[1/3*largeur-espacement,-1/4*hauteur])
            + rectangle(tab,xDeb+largeur,yDeb+(3*hauteur/4),[-largeur_pol,0],[-italique+espacement,-1/2*hauteur])
            + rectangle(tab,xDeb-(italique+espacement)/4,yDeb+(3*hauteur/4)-espacement,[-italique,-3/4*hauteur + espacement],[largeur_pol,0])
            + rectangle(tab,xDeb+(italique/4)-espacement,yDeb+hauteur/4,[-italique,-1/4*hauteur],[largeur-largeur_pol,0]);
    };
    let lettre_V = function (tab,xDeb,yDeb,hauteur,largeur,italique){
        let largeur_pol = largeur/4;
        let hauteur_pol = hauteur/4;
        let espacement = hauteur_pol/4;
        return rectangle(tab,xDeb,yDeb+hauteur,[0,-hauteur_pol],[largeur_pol+espacement,0])
            + rectangle(tab,xDeb+espacement+largeur_pol,yDeb+hauteur,[-italique,-largeur_pol],[largeur/2 -largeur_pol+espacement-italique,-hauteur+hauteur_pol+italique+espacement])
            + rectangle(tab,xDeb+largeur/2-2*italique+2*espacement,yDeb+hauteur_pol,[italique-espacement,-hauteur_pol],[largeur/2-(largeur_pol+espacement)+italique,hauteur-hauteur_pol])
            + rectangle(tab,xDeb-largeur_pol + largeur-italique+espacement,yDeb+hauteur,[0,-largeur_pol],[largeur_pol+espacement,0]);

    };
    let mot_DVD = function (tab,xDeb,yDeb,hauteur,largeur){
        return lettre_D(tab,xDeb+.1,yDeb,hauteur,largeur/3,.1)
            + lettre_V(tab,xDeb+largeur/3+.02,yDeb,hauteur,largeur/3,.05)
            + lettre_D(tab,xDeb+2*largeur/3,yDeb,hauteur,largeur/3,.1);
    };

    this.forme.nombre_triangles += mot_DVD(this.forme.tab_coord,-.5,-1/6,1/3,1);
    this.forme.taille[0] = 1/2;
    this.forme.taille[1] = 1/6;

    this.buf_coord = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.buf_coord);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.forme.tab_coord), this.gl.STATIC_DRAW);
}

Texture_nouvelle.prototype.rendre = function (){
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.framebuffer);
    this.gl.useProgram(this.prog);

    this.gl.clearColor(1,1,1,1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.viewport(0,0,this.width_text,this.height_text);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ZERO, this.gl.ONE);
    this.gl.lineWidth(2);
    this.gl.enableVertexAttribArray(this.a_coords_loc_texture);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buf_coord);
    this.gl.vertexAttribPointer(this.a_coords_loc_texture, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.a_coords_loc_texture);

    //Couleur
    this.gl.uniform4fv(this.u_color_texture, this.forme.couleur);
    this.gl.uniform2f(this.u_translation_texture,this.forme.centre[0],this.forme.centre[1]);
    //Coordonnées
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.forme.nombre_triangles);

    this.gl.disableVertexAttribArray(this.a_coords_loc_texture);
    this.gl.disable(this.gl.BLEND);
}

Texture_nouvelle.prototype.update = function (){
    let toucher = false;
    this.forme.centre[0] += this.forme.deplacement[0]*this.forme.vitesse * Math.cos(this.forme.angle*Math.PI*2);
    //Si on sort des limites, alors on doit procéder à un changement de direction
    if(this.forme.centre[0] > 1-this.forme.taille[0] || this.forme.centre[0] < -1+this.forme.taille[0]){
        toucher = true;
        this.forme.deplacement[0] = this.forme.deplacement[0] * (-1);
    }
    //La nouvelle coordonnées y est formée de l'ancienne plus le décalage par rapport à son vecteur direction et sa vitesse et sa rotation sur lui même
    this.forme.centre[1] += this.forme.deplacement[1]*this.forme.vitesse * Math.sin(this.forme.angle*Math.PI*2);
    //Si on sort des limites, alors on doit procéder à un changement de direction
    if(this.forme.centre[1] > 1-this.forme.taille[1] || this.forme.centre[1] < -1+this.forme.taille[1]){
        toucher = true;
        this.forme.deplacement[1] = this.forme.deplacement[1] * (-1);
    }
    if(toucher){
        this.forme.couleur = [Math.random(),Math.random(),Math.random(),1];
        this.forme.vitesse+=.0005;
        this.forme.angle += (Math.random()-1)*.001;
    }
}

