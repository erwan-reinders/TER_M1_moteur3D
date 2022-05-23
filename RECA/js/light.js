/*Classe modélisant une lumière*/
class Light {
    
    /**Constructeur d'une lumière.
     * @param {vec3} pos Position de la lumière.
     * @param {vec3} color Couleur de la lumière (RGB).
     * @param {number} linear L'atténuation linéaire de la lumière.
     * @param {number} quadratic L'atténuation quadratique de la lumière.
     */
    constructor(pos, color = [1.0, 1.0, 1.0], linear = 0.7, quadratic = 0.18) {
        this.position  = pos ? vec3.clone(pos) : vec3.clone([2, 3, 1]);
        this.color     = vec3.clone(color);
        this.linear    = linear;
        this.quadratic = quadratic;
    }
}