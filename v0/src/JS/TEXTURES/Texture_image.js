/*Classe modélisant un texture à partir d'une image*/

/*Constructeur d'une texture_image
    * @param gl : Objet représentant le contexte de dessin WEBGL du canvas de rendu
    * @param srcImg : emplacement de l'image servant de texture*/
function Texture_image(gl, srcImg) {
    //console.log(" ==== JE CONSTRUIT UNE TEXTURE_IMAGE A PARTIR DE");
    //console.log(gl);
    //console.log(srcImg);
    Texture.call(this,gl,"","");

    this.image = new Image();
    this.dessinable = false;
    this.requestCORSIfNotSameOrigin(srcImg);
    this.image.src = srcImg;
    let obj = this;
    this.image.addEventListener('load', function() {
        console.log("J'AI CHARGE L'IMAGE");
        obj.gl.bindTexture(obj.gl.TEXTURE_2D, obj.texture);
        obj.gl.texImage2D(obj.gl.TEXTURE_2D, 0, obj.gl.RGBA, obj.gl.RGBA, obj.gl.UNSIGNED_BYTE, obj.image);

        if (Texture_image.isPowerOf2(obj.image.width) && Texture_image.isPowerOf2(obj.image.height)) {
            // Oui, c'est une puissance de 2. Générer les mips
            obj.gl.generateMipmap(obj.gl.TEXTURE_2D);
        } else {
            // Non, ce n'est pas une puissance de 2. Désactiver les mips et définir l'habillage
            // comme "accrocher au bord"
            obj.gl.texParameteri(obj.gl.TEXTURE_2D, obj.gl.TEXTURE_WRAP_S, obj.gl.CLAMP_TO_EDGE);
            obj.gl.texParameteri(obj.gl.TEXTURE_2D, obj.gl.TEXTURE_WRAP_T, obj.gl.CLAMP_TO_EDGE);
            obj.gl.texParameteri(obj.gl.TEXTURE_2D, obj.gl.TEXTURE_MIN_FILTER, obj.gl.LINEAR);
        }
        obj.dessinable = true;
    });
    //console.log(" ==== FIN DE CONSTRUCTION");
}

Texture_image.prototype = Object.create(Texture.prototype);
Texture_image.prototype.constructor = Texture_image;

Texture_image.prototype.init = function (){
    this.texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, /*Couleur par défaut si pas d'image*/new Uint8Array([0, 0, 255, 255]));
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
    //while(!this.dessinable);
}

/*Méthode permettant de rechercher une image
 * @param url : String URL de l'image à chercher*/
Texture_image.prototype.requestCORSIfNotSameOrigin = function (url) {
    if ((new URL(url, window.location.href)).origin !== window.location.origin) {
        this.image.crossOrigin = "";
    }
}

/*Fonction permettant de connaitre si une valeur est une puissance de 2
* @param value : valeur que l'on cherche à évaluer
* @return vrai si value est une puissance de deux, faux sinon*/
Texture_image.isPowerOf2 = function (value) {
    return (value & (value - 1)) == 0;
}