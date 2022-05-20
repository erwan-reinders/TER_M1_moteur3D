/*Classe modélisant un collider OBB*/
class OBB extends Collider{

    /**
     * Conctructeur d'une OBB
     * @param {Float32Array} center du collider
     * @param {Float32Array} size du collider
     * @param {Float32Array} orientation du collider
     **/
    constructor(center, size,orientation) {
        super();

        this.center = center;
        this.size   = size;
        this.orientation = orientation

        this.dimension  = vec3.create();
        this.position   = vec3.create();
    }

    static fromObject(t, in_vertices) {
        let cur_pt = vec3.clone([
            in_vertices[0],
            in_vertices[1],
            in_vertices[2],
        ]);

        let min_dim = 1;

        let min_x = cur_pt[0];
        let max_x = cur_pt[0];
        let min_y = cur_pt[1];
        let max_y = cur_pt[1];
        let min_z = cur_pt[2];
        let max_z = cur_pt[2];

        let nb = 0;
        for (let i = 0; i < in_vertices.length; i+=3) {
            let cur_pt = vec3.clone([
                in_vertices[i],
                in_vertices[i+1],
                in_vertices[i+2],
            ]);

            if (cur_pt[0] < min_x) {
                min_x = cur_pt[0];
            }
            if (cur_pt[0] > max_x) {
                max_x = cur_pt[0];
            }
            if (cur_pt[1] < min_y) {
                min_y = cur_pt[1];
            }
            if (cur_pt[1] > max_y) {
                max_y = cur_pt[1];
            }
            if (cur_pt[2] < min_z) {
                min_z = cur_pt[2];
            }
            if (cur_pt[2] > max_z) {
                max_z = cur_pt[2];
            }
        }

        let dim_x = max_x - min_x;
        let dim_y = max_y - min_y;
        let dim_z = max_z - min_z;

        dim_x *= t[0];
        dim_y *= t[5];
        dim_z *= t[10];


        dim_x = (dim_x < min_dim) ? min_dim : dim_x;
        dim_y = (dim_y < min_dim) ? min_dim : dim_y;
        dim_z = (dim_z < min_dim) ? min_dim : dim_z;


        return new OBB(
            vec3.clone([
                (max_x + min_x) / 2.0,
                (max_y + min_y) / 2.0,
                (max_z + min_z) / 2.0]
            ),
            vec3.clone([
                dim_x / 2.0,
                dim_y / 2.0,
                dim_z / 2.0]
            ),
            mat3.clone([
                t[0],t[1],t[2],
                t[4],t[5],t[6],
                t[8],t[9],t[10]
            ])
        );
    }

    doesIntersectRayon(rayon) {
        let outResult = {};
        let p = vec3.subtract([], this.position, rayon.origine);

        let X = vec3.clone([this.orientation[0], this.orientation[1], this.orientation[2]]);
        let Y = vec3.clone([this.orientation[3], this.orientation[4], this.orientation[5]]);
        let Z = vec3.clone([this.orientation[6], this.orientation[7], this.orientation[8]]);

        let f = vec3.clone([
            vec3.dot(X, rayon.direction),
            vec3.dot(Y, rayon.direction),
            vec3.dot(Z, rayon.direction)
        ]);

        let e = vec3.clone([
            vec3.dot(X, p),
            vec3.dot(Y, p),
            vec3.dot(Z, p)
        ]);

        let t = [0, 0, 0, 0, 0, 0];

        for (let i = 0; i < 3; ++i) {
            if (compareWithEpsilon(f[i], 0)) {
                if (-e[i] - this.size[i] > 0 || -e[i] + this.size[i] < 0) {
                    return undefined;
                }
                f[i] = 0.00001; //Pas diviser par zéros
            }

            t[i * 2 + 0] = (e[i] + this.size[i]) / f[i]; // tmin[x, y, z]
            t[i * 2 + 1] = (e[i] - this.size[i]) / f[i]; // tmax[x, y, z]
        }

        let tmin = Math.max(Math.max(Math.min(t[0], t[1]), Math.min(t[2], t[3])), Math.min(t[4], t[5]));
        let tmax = Math.min(Math.min(Math.max(t[0], t[1]), Math.max(t[2], t[3])), Math.max(t[4], t[5]));

        if (tmax < 0) {
            return undefined;
        }

        if (tmin > tmax) {
            return undefined;
        }

        // If tmin is < 0, tmax is closer
        let t_result = tmin;
        if (tmin < 0.0) {
            t_result = tmax;
        }

        outResult.hit = true;
        outResult.t = t_result;
        outResult.point = vec3.add([], rayon.origine, vec3.scale([], rayon.direction, t_result));

        let normals = [
            X,			// +x
            X * -1.0,	// -x
            Y,			// +y
            Y * -1.0,	// -y
            Z,			// +z
            Z * -1.0	// -z
        ];

        for (let i = 0; i < 6; ++i) {
            if (compareWithEpsilon(t_result, t[i])) {
                outResult.normal = vec3.normalize([], normals[i]);
            }
        }
        return outResult;
    }

    isPointOn(point) {
        let dir             = vec3.subtract([],point, this.position);
        for (let i = 0; i < 3; ++i) {
            let axis        = this.orientation[i];
            let distance    = vec3.dot(dir, axis);

            if (distance > this.size[i]) {
                return false;
            }
            if (distance < -this.size[i]) {
                return false;
            }
        }
        return true;
    }

    lineTest(line) {
        let dif         = vec3.subtract([], line.end, line.start);
        let length_sq   = vec3.dot(dif, dif);
        if (length_sq < 0.0000001) {
            return this.isPointOn(line.start);
        }

        let ray = new Ray(line.start, line.end);

        let result      = this.doesIntersectRayon(ray);
        if (result === undefined) {
            return false;
        }
        let t = result.t;

        return t >= 0 && t * t <= length_sq;
    }

    nearestPointOnCollider(point) {
        let result  = vec3.clone(this.position);
        let dir     = vec3.subtract([], point, this.position);

        //Now we iterate on the orientation of OBB
        for (let i = 0; i < 3; ++i) {

            let axis = vec3.clone([
                this.orientation[i*3],
                this.orientation[i*3+1],
                this.orientation[i*3+2]
            ]);

            let distance = vec3.dot(dir, axis);

            if (distance > this.size[i]) {
                distance = this.size[i];
            }
            if (distance < -this.size[i]) {
                distance = -this.size[i];
            }
            result = result + (axis * distance);
        }
        return result;
    }

    transform(transformation) {
        this.position       = vec3.add([],this.position,vec3.clone([transformation[12],transformation[13],transformation[14]]));
        this.orientation    = mat3.clone([
            transformation[0],transformation[1],transformation[2],
            transformation[4],transformation[5],transformation[6],
            transformation[8],transformation[9],transformation[10]
        ]);
    }
}