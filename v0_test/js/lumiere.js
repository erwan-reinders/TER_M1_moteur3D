/*Classe modélisant une lumière*/

class Lumiere {
    /**Constructeur d'une lumiere
     * @param pos : vec3 position de la lumière
     * @prama color : vec3 renseignant la couleur d'une lumière **/
    constructor(pos, color) {
        this.position = pos;
        this.color = color;
    }
}