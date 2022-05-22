/*Classe représentant un modèle 3D*/

/*Constructeur d'un model
    * @param gl : Objet représentant le contexte de dessin WEBGL du canvas de rendu
    * @param modelData : ObjetModel renseignant les sommets, la géométrie et les normales d'un objet 3D représentant notre modèle
    * @param texture : Texture à appliquer à notre modèle
    * @param vertexSH : ID_HTMLVertexShader du programme de dessin du modèle
    * @param fragmentSH : ID_HTMLFragmentShader du programme de dessin du modèle
    * @param hauteur : Hauteur de la zone de dessin (canva.height)
    * @param largeur : Largeur de la zone de dessin (canva.height)
    * @param rotator : trackball rotator*/
function Model(gl,modelData, texture, vertexSH_id,fragmentSH_id,hauteur,largeur,rotator) {
    //console.log(" ==== JE CONSTRUIT UN MODELE A PARTIR DE ");
    //console.log(gl);
    //console.log(modelData);
    //console.log(texture);
    //console.log(vertexSH_id);
    //console.log(fragmentSH_id);
    //console.log(hauteur);
    //console.log(largeur);
    //console.log(rotator);

    ProgrammeShader.call(this,gl,vertexSH_id,fragmentSH_id);
    this.createProgram();
    this.modelData = modelData;
    this.texture = texture;
    this.hauteur = hauteur;
    this.largeur = largeur;

    this.rotator = rotator;

    this.projection = mat4.create();
    this.normalMatrix = mat3.create();
    this.textureTransform = mat3.create();

    this.transformation = mat3.create();
    this.translation = vec3.create();
    //console.log(" ==== FIN DE CONSTRUCTION");
}

Model.prototype = Object.create(ProgrammeShader.prototype);
Model.prototype.constructor = Model;

/*Méthode permettant de renseigner une transformation au modèle
    * @param t : mat3 de transformation du modèle*/
Model.prototype.ajouterTransformation = function (t){
    this.transformation = t;
}

/*Méthode permettant de renseigner une translation au modèle
* @param t : mat3 de translation du modèle*/
Model.prototype.appliquerTranslation = function (t){
    vec3.add(this.translation,this.translation,t);
}

/*Méthode permettant d'initialiser le contexte de dessin du modèle*/
Model.prototype.init = function (){
    this.texture.init();

    this.gl.useProgram(this.prog);
    //Récupération des attributs
    this.a_coords_loc =  this.gl.getAttribLocation(this.prog, "a_coords");
    this.a_normal_loc =  this.gl.getAttribLocation(this.prog, "a_normal");
    this.a_texCoords_loc =  this.gl.getAttribLocation(this.prog, "a_texCoords");

    //Récupération des uniforms
    this.u_modelview = this.gl.getUniformLocation(this.prog, "modelview");
    this.u_projection = this.gl.getUniformLocation(this.prog, "projection");
    this.u_normalMatrix = this.gl.getUniformLocation(this.prog, "normalMatrix");
    this.u_texture = this.gl.getUniformLocation(this.prog, "texture");
    this.u_textureScale = this.gl.getUniformLocation(this.prog, "textureScale");
    console.log("TOUT VA BIEN INIT MODEL");

    //Tranformation et translation
    this.u_transformation = this.gl.getUniformLocation(this.prog, "transformation");
    this.u_translation = this.gl.getUniformLocation(this.prog, "translation");
    console.log("TOUT VA BIEN INIT MODEL (apres trans)");


    this.gl.uniform1i(this.u_texture, 0);  // Qu'une seule unité de texture ici = 0
    this.gl.uniform1f(this.u_textureScale,1);

    mat4.perspective(this.projection, Math.PI/10, this.largeur/this.hauteur, 1, 10);
    this.gl.uniformMatrix4fv(this.u_projection, false, this.projection);

    this.createModel();
}

/*Méthode permettant de créer le contexte de dessin associer au modèle et de lui renseigner une méthodologie de rendu*/
Model.prototype.createModel = function () {
    this.model = {};
    this.model.coordsBuffer = this.gl.createBuffer();
    this.model.normalBuffer = this.gl.createBuffer();
    this.model.texCoordsBuffer = this.gl.createBuffer();
    this.model.indexBuffer = this.gl.createBuffer();
    this.model.count = this.modelData.indices.length;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.model.coordsBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.modelData.vertexPositions, this.gl.STATIC_DRAW);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.model.normalBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.modelData.vertexNormals, this.gl.STATIC_DRAW);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.model.texCoordsBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.modelData.vertexTextureCoords, this.gl.STATIC_DRAW);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.model.indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.modelData.indices, this.gl.STATIC_DRAW);
    let obj = this;
    this.model.render = function() {
        obj.gl.bindBuffer(obj.gl.ARRAY_BUFFER, obj.model.coordsBuffer);
        obj.gl.vertexAttribPointer(obj.a_coords_loc, 3, obj.gl.FLOAT, false, 0, 0);
        obj.gl.bindBuffer(obj.gl.ARRAY_BUFFER, obj.model.normalBuffer);
        obj.gl.vertexAttribPointer(obj.a_normal_loc, 3, obj.gl.FLOAT, false, 0, 0);
        obj.gl.bindBuffer(obj.gl.ARRAY_BUFFER, obj.model.texCoordsBuffer);
        obj.gl.vertexAttribPointer(obj.a_texCoords_loc, 2, obj.gl.FLOAT, false, 0, 0);
        obj.gl.uniformMatrix4fv(obj.u_modelview, false, obj.modelview);
        mat3.normalFromMat4(obj.normalMatrix, obj.modelview);

        obj.gl.uniformMatrix3fv(obj.u_transformation, false, obj.transformation);
        obj.gl.uniform3f(obj.u_translation, obj.translation[0],obj.translation[1],obj.translation[2]);

        obj.gl.uniformMatrix3fv(obj.u_normalMatrix, false, obj.normalMatrix);
        obj.gl.bindBuffer(obj.gl.ELEMENT_ARRAY_BUFFER, obj.model.indexBuffer);
        obj.gl.drawElements(obj.gl.TRIANGLES, obj.model.count, obj.gl.UNSIGNED_SHORT, 0);
        //console.log("TOUT VA BIEN RENDRE MODEL");
    };
}

/*Méthode permettant de dessiner un modèle par rapport à sa texture*/
Model.prototype.dessiner = function (){
    //On rend d'abord la texture asoociée à l'objet
    this.texture.rendre();

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null);

    this.gl.useProgram(this.prog);
    this.gl.clearColor(0,0,0,1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.viewport(0,0,this.largeur,this.hauteur);
    this.gl.enableVertexAttribArray(this.a_coords_loc);
    this.gl.enableVertexAttribArray(this.a_normal_loc);
    this.gl.enableVertexAttribArray(this.a_texCoords_loc);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture.texture);

    this.modelview = this.rotator.getViewMatrix();
    this.model.render();

    this.gl.disableVertexAttribArray(this.a_coords_loc);
    this.gl.disableVertexAttribArray(this.a_normal_loc);
    this.gl.disableVertexAttribArray(this.a_texCoords_loc);
}

/*Méthode permettant d'animer un modèle*/
Model.prototype.update = function (){
    this.texture.update();
}