/*Classe modélisant une texture*/
//Requires("programmeShader.js");

/*Constructeur d'une texture
    * @param gl : Objet représentant le contexte de dessin WEBGL du canvas de rendu
    * @param vertexSH : ID_HTMLVertexShader de notre texture
    * @param fragmentSH : ID_HTMLFragmentShader de notre texture*/
function Texture(gl,vertexSH_id,fragmentSH_id) {
    //console.log(" ==== JE CONSTRUIT UNE TEXTURE A PARTIR DE ");
    //console.log(gl);
    //console.log(vertexSH_id);
    //console.log(fragmentSH_id);

    ProgrammeShader.call(this,gl,vertexSH_id,fragmentSH_id);

    this.texture = this.gl.createTexture();

    //console.log(this);
    //console.log(" ==== FIN DE CONSTRUCTION");
}

Texture.prototype = Object.create(ProgrammeShader.prototype);
Texture.prototype.constructor = Texture;

/*Méthode permettant d'initialiser la texture*/
Texture.prototype.init = function (){};

/*Méthode permettant de MAJ la texture*/
Texture.prototype.update = function (){};

/*Méthode permettant d'initialiser la data de la texture*/
Texture.prototype.init_data = function (){};

/*Méthode permettant de rendre la texture (utile pour les textures par programme annexe)*/
Texture.prototype.rendre = function (){};