/*Constructeur d'une ligne*/
class Line {

    constructor(start, end) {
        this.start = start;
        this.end = end;
    }

    /**
     *  Retourne le vecteur normalisé représentant la ligne
     **/
    getNormalDirectionVector(){
        return vec3.normalize([],vec3.subtract([],this.end,this.start));
    }


    /**
     *  Retourne le point le plus proche de point sur la ligne
     *  @param {Float32Array} point à projeter sur la ligne
     **/
    closestPoint(point) {
        let lVec = this.end - this.start;
        let t = vec3.dot(point - this.start, lVec) / Math.dot(lVec, lVec);
        t = ((t < 0.0) ? 0.0 : ((t > 1.0) ? 1.0 : t));
        return this.start + lVec * t;
    }
}