/*Classe modélisant une lumière*/

class Light {
    /**Constructeur d'une lumière
     * @param pos : vec3 position de la lumière
     * @param color : vec3 couleur de la lumière (RGB) **/
    constructor(pos, color) {
        this.position = pos ?? vec3.clone([2, 5, 1]);
        this.color = color ?? vec3.clone([1, 1, 1]);
    }
}