/*Classe modélisant un collider AABB*/
class AABB extends Collider{
    /**
     * Conctructeur d'une OBB
     * @param {Float32Array} center du collider
     * @param {Float32Array} size du collider
     **/
    constructor(center, size) {
        super();
        this.center = center;
        this.size   = size;

        this.dimension  = vec3.create();
        this.position   = vec3.create();

        this.verticesUnitCube = [
            [-1, -1, 1],
            [1, -1, 1],
            [-1, 1, 1],
            [1, 1, 1],
            [-1, -1, -1],
            [1, -1, -1],
            [-1, 1, -1],
            [1, 1, -1]
        ];
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


        return new AABB(
            vec3.clone([
                (max_x + min_x) / 2.0,
                (max_y + min_y) / 2.0,
                (max_z + min_z) / 2.0]
            ),
            vec3.clone([
                dim_x / 2.0,
                dim_y / 2.0,
                dim_z / 2.0]
            )
        );
    }

    getAccurateMinMax(){
        return {
            min : -this.dimension/2,
            max : this.dimension/2,
        }
    }

    doesIntersectRayon(rayon) {
        let outResult = {};
        let dim = this.getAccurateMinMax();

        let t1 = (dim.min[0] - rayon.origine[0]) / (compareWithEpsilon(rayon.direction[0], 0.0) ? 0.00001 : rayon.direction[0]);
        let t2 = (dim.max[0] - rayon.origine[0]) / (compareWithEpsilon(rayon.direction[0], 0.0) ? 0.00001 : rayon.direction[0]);
        let t3 = (dim.min[1] - rayon.origine[1]) / (compareWithEpsilon(rayon.direction[0], 0.0) ? 0.00001 : rayon.direction[1]);
        let t4 = (dim.max[1] - rayon.origine[1]) / (compareWithEpsilon(rayon.direction[0], 0.0) ? 0.00001 : rayon.direction[1]);
        let t5 = (dim.min[2] - rayon.origine[2]) / (compareWithEpsilon(rayon.direction[0], 0.0) ? 0.00001 : rayon.direction[2]);
        let t6 = (dim.max[2] - rayon.origine[2]) / (compareWithEpsilon(rayon.direction[0], 0.0) ? 0.00001 : rayon.direction[2]);

        //Détermination des points d'entré et de sortie du rayon d'après les deux axes d'observation
        let tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));
        let tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6));

        //tmax<0 => touché mais AABB derrière le rayon
        if (tmax < 0) {
            return undefined;
        }
        //Pas touché
        if (tmin > tmax) {
            return undefined;
        }

        let t_result = tmin;

        // tmax le plus proche ?
        if (tmin < 0.0) {
            t_result = tmax;
        }

        outResult.t = t_result;
        outResult.hit = true;
        outResult.point = rayon.origine + rayon.direction * t_result;

        let normals = [
            new Array(-1, 0, 0),
            new Array(1, 0, 0),
            new Array(0, -1, 0),
            new Array(0, 1, 0),
            new Array(0, 0, -1),
            new Array(0, 0, 1)
        ];
        let t = {t1, t2, t3, t4, t5, t6};

        for (let i = 0; i < 6; ++i) {
            if (compareWithEpsilon(t_result, t[i])) {
                outResult.normal = normals[i];
            }
        }
        return outResult;
    }

    isPointOn(point) {
        let dim = this.getAccurateMinMax();

        vec3.add([],dim.min,this.position);
        vec3.add([],dim.max,this.position);

        if (point[0] < dim.min[0] || point[1] < dim.min[1] || point[2] < dim.min[2]) {
            return false;
        }
        if (point[0] > dim.max[0] || point[1] > dim.max[1] || point[2] > dim.max[2]) {
            return false;
        }
        return true;
    }

    lineTest(line) {
        let ray = new Ray(line.start, line.getNormalDirectionVector());
        let res_raycast = this.doesIntersectRayon(ray);
        if (res_raycast) {
            let t = res_raycast.t;
            let dif = vec3.subtract([], line.end,line.start);
            return t >= 0 && t * t <= vec3.dot(dif,dif);
        }
        return false;
    }

    nearestPointOnCollider(point) {
        let dim = this.getAccurateMinMax();
        vec3.add([], dim.min, this.position);
        vec3.add([], dim.max, this.position);

        let result = vec3.create();

        //Clamp to min
        result[0] = (result[0] < dim.min[0]) ? dim.min[0] : result[0];
        result[1] = (result[1] < dim.min[1]) ? dim.min[1] : result[1];
        result[2] = (result[2] < dim.min[2]) ? dim.min[2] : result[2];

        //Clamp to max
        result[0] = (result[0] < dim.max[0]) ? dim.max[0] : result[0];
        result[1] = (result[1] < dim.max[1]) ? dim.max[1] : result[1];
        result[2] = (result[2] < dim.max[2]) ? dim.max[2] : result[2];
        return result;
    }

    transform(transformation) {
        let v1 = vec3.scale([], vec3.clone([transformation[0],transformation[1],transformation[2]]),this.size[0]);
        let v2 = vec3.scale([], vec3.clone([transformation[4],transformation[5],transformation[6]]),this.size[1]);
        let v3 = vec3.scale([], vec3.clone([transformation[8],transformation[9],transformation[10]]),this.size[2]);

        let min = vec3.add(
            [],
            vec3.scale(
                [],
                this.verticesUnitCube[0][0],
                v1
            ),
            vec3.add(
                vec3.scale(
                    [],
                    this.verticesUnitCube[0][1],
                    v2
                ),
                vec3.scale(
                    [],
                    this.verticesUnitCube[0][2],
                    v2
                )
            )
        );

        let max = vec3.add(
            [],
            vec3.scale(
                [],
                this.verticesUnitCube[0][0],
                v1
            ),
            vec3.add(
                vec3.scale(
                    [],
                    this.verticesUnitCube[0][1],
                    v2
                ),
                vec3.scale(
                    [],
                    this.verticesUnitCube[0][2],
                    v2
                )
            )
        );
        for (let i = 1; i < 8; i++){
            let vertex = vec3.add(
                [],
                vec3.scale(
                    [],
                    this.verticesUnitCube[i][0],
                    v1
                ),
                vec3.add(
                    vec3.scale(
                        [],
                        this.verticesUnitCube[i][1],
                        v2
                    ),
                    vec3.scale(
                        [],
                        this.verticesUnitCube[i][2],
                        v2
                    )
                )
            );

            min = minVec3(vertex,min);
            max = maxVec3(vertex,max);
        }

        this.dimension = (max - min)/2.0;
        this.position = vec3.add([],this.position,vec3.clone([transformation[13],transformation[14],transformation[15]]));
    }
}