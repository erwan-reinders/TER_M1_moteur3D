const colliderType = {
    CUBE    : 1,
    SPHERE  : 2
}
/*Classe modélisant un collider pour un objet*/
class Collider {
    /**
    *Constructeur d'un collider
    **/
    constructor() {
        if(this.constructor === Collider){
            throw new Error("On ne peut pas construire de collider comme ca !");
        }

        this.drawn = false;

        this.rayAnswer = {
            hit : false,
            t : Number.MAX_VALUE,
            point : undefined,
            normal : undefined,
        }
        this.type = colliderType.CUBE;
    }

    /**Fonction permettant de reset la réponse d'intersection avec le rayon**/
    resetRayIntersection(){
        this.rayAnswer.hit      = false;
        this.rayAnswer.t        = Number.MAX_VALUE;
        this.rayAnswer.point    = undefined;
        this.rayAnswer.normal   = undefined;

        this.drawn = false;
    }

    /**
    *Fonction permettant de renseigner si un point se trouve dans le collider en question
    * @abstract
    * @param {Float32Array} point à regarder
    **/
    isPointOn(point){}

    /**
     *Fonction permettant de renseigner si un segment intersecte un collider
     * @abstract
     * @param {Line} line à regarder
     **/
    lineTest(line){

    }

    /**
     *Fonction permettant de renseigner si un rayon intersecte le collider
     * @abstract
     * @param {Ray} rayon à regarder
     **/
    doesIntersectRayon(rayon){
    }

    /**
     *Fonction permettant de renseigner le point le plus proche dans collider depuis le point renseigné
     * @abstract
     **/
    nearestPointOnCollider(point){
    }

    /**Fonction permettant de déplacer un collider
     * @abstract
     * @param {Float32Array} transformation à appliquer au collider**/
    transform(transformation){
    }

    /**Fonction permettant de construire un collider à partir des données d'un maillage
     * @abstract
     * @param {Float32Array} t transformation (mat4) du maillage originel
     * @param {Array} in_vertices points du maillage
     * **/
    static fromObject(t, in_vertices) {}
}


