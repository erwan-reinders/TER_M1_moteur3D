/*Classe modélisant un collider Shere*/
class Sphere extends Collider{

    constructor(center, rayon) {
        super();

        this.center = center;
        this.rayon  = rayon ;

        this.position   = vec3.create();
        this.type = colliderType.SPHERE;

        this.dimension = vec3.clone([rayon,rayon,rayon]);
    }

    static fromObject(t, in_vertices) {
        let tmpPosition = vec3.clone([0,0,0]);
        let tmpVertexPos;
        let vertexPos;
        let tmpRadius   = 0;

        for (let i = 0, size = in_vertices.length; i < size; i+=3) {
            tmpVertexPos = vec3.clone([
                in_vertices[i],
                in_vertices[i+1],
                in_vertices[i+2],
            ]);

            vertexPos = multVec3Mat3(
                vec3.clone([
                    tmpVertexPos[0],
                    tmpVertexPos[1],
                    tmpVertexPos[2],
                ]),
                mat3.clone([
                    t[0], t[1], t[2],
                    t[4], t[5], t[6],
                    t[8], t[9], t[10]]
                )
            );
            tmpPosition = vec3.add([], vertexPos, tmpPosition);
        }
        tmpPosition = vec3.scale([], tmpPosition, 1/in_vertices.length);

        for (let i = 0, size = in_vertices.length; i < size; i+=3) {
            tmpVertexPos = vec3.clone([
                in_vertices[i],
                in_vertices[i+1],
                in_vertices[i+2],
            ]);

            vertexPos = multVec3Mat3(
                vec3.clone([
                    tmpVertexPos[0],
                    tmpVertexPos[1],
                    tmpVertexPos[2],
                ]),
                mat3.clone([
                    t[0], t[1], t[2],
                    t[4], t[5], t[6],
                    t[8], t[9], t[10]]
                )
            );

            tmpRadius = Math.max(tmpRadius, vec3.distance(tmpPosition, vertexPos));
        }
        return new Sphere(tmpPosition, tmpRadius);
    }

    doesIntersectRayon(rayon) {
        let e   = vec3.subtract([], this.position, rayon.origine);
        let rSq = this.rayon* this.rayon;
        let eSq = vec3.dot(e, e);
        let a   = vec3.dot(e, rayon.direction);
        let bSq = eSq - (a * a);
        let f   = Math.sqrt(Math.abs((rSq) - bSq));
        let t   = a - f;

        // Pas de collisions
        if (rSq - (eSq - a * a) < 0.0) {
            return;
        } else if (eSq < rSq) {    // Rayon dans la sphère
            t = a + f;
        }

        this.rayAnswer.t         = t;
        this.rayAnswer.hit       = true;
        this.rayAnswer.point     = vec3.add([],rayon.origine, vec3.scale([],rayon.direction, t));
        this.rayAnswer.normal    = vec3.normalize([], vec3.subtract([],this.rayAnswer.point,this.position));
    }

    isPointOn(point) {
        return vec3.length(vec3.subtract([], point, this.position)) < this.rayon * this.rayon;
    }

    lineTest(line) {
        let closest     = line.closestPoint(this.position);
        let dif         = this.position - closest;
        let distSq      = vec3.dot(dif, dif);
        return distSq <= (this.rayon * this.rayon);
    }

    nearestPointOnCollider(point) {
        let sphereToPoint   = vec3.normalize([],vec3.subtract(point, this.position));
        sphereToPoint       = vec3.scale(sphereToPoint,this.rayon);
        return vec3.add([], sphereToPoint, this.position);
    }

    transform(transformation) {
        //On applique que la translation
        this.position = vec3.add([],this.center,vec3.clone([transformation[12],transformation[13],transformation[14]]));
    }
}