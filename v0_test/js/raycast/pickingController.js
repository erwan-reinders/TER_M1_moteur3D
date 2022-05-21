let raycastPoll = [];

/*Classe modélisant un controlleur pour le piclking d'objets dans la scène */
class PickingController {

    /**
     * Construit le controleur.
     * @param {Scene} scene La scene que l'on vas modifier.
     */
    constructor(scene) {
        this.lastElemCollid = undefined;
        this.moving = false;
    }

    onMouseDown(event) {
        if(event.button ===0) {
            let t;
            let coord = getCursorPosition(canvas, event);

            let w = canvas.getBoundingClientRect().width;
            let h = canvas.getBoundingClientRect().height;

            let ray = new Ray();
            ray.getPickRay(
                vec2.clone([coord.xcoord, coord.ycoord]),
                vec2.clone([0, 0]),
                vec2.clone([w, h]),
                scenes[currentScene].camera.getViewMatrix(),
                scenes[currentScene].camera.getProjectionMatrix(),
                scenes[currentScene].camera.position
            );
            raycastPoll.push(ray);
            t = Number.MAX_VALUE;
            let obj = undefined;
            ray.t = 100;

            //On va d'abord tester si on est pas encore en train de clicker sur

            //On teste ensuite pour tous les éléments possédant un collider
            for (let el of scenes[currentScene].models) {
                if (el.collider) {
                    el.collider.resetRayIntersection();
                    //On peut donc lancer un rayon et déterminer le point d'impact
                    el.collider.doesIntersectRayon(ray);
                    if (el.collider.rayAnswer.hit) {
                        ray.t = el.collider.rayAnswer.t;

                        let objectT = el.collider.rayAnswer.t;
                        if (objectT < t) {
                            t = objectT;
                            if (obj) {
                                obj.resetRayIntersection();
                            }
                            obj = el;
                        }
                        this.moving = true;
                    }
                }
            }

            ray.initDataDrawing();
            if (obj) {
                obj.collider.drawn = true;

                if (obj.collider.type == colliderType.SPHERE) {
                    obj.collider.rayAnswer.normal = vec3.scale([], scenes[currentScene].camera.getForward(), -1.0);
                }

                this.currentTranslationObj = vec3.clone([obj.matrix.modelMatrix[12], obj.matrix.modelMatrix[13], obj.matrix.modelMatrix[14]]);
                this.movementDistance = vec3.dot(
                    obj.collider.rayAnswer.point,
                    obj.collider.rayAnswer.normal
                );
            }
            this.lastElemCollid = obj;
        }
    }

    onMouseUp(event) {
        this.moving = false;
        canvas.style.cursor = "default";
    }

    onMouseMove(event) {
        //Si on a intersecté quelque chose et que l'on est en train de déplacer la souris
        if (this.lastElemCollid && this.moving) {
            canvas.style.cursor = "grabbing";

            let coord = getCursorPosition(canvas,event);
            let w = canvas.getBoundingClientRect().width;
            let h = canvas.getBoundingClientRect().height;
            let ray = new Ray();
            ray.getPickRay(
                vec2.clone([coord.xcoord,coord.ycoord]),
                vec2.clone([0,0]),
                vec2.clone([w,h]),
                scenes[currentScene].camera.getViewMatrix(),
                scenes[currentScene].camera.getProjectionMatrix(),
                scenes[currentScene].camera.position
            );
            let deno =      vec3.dot(this.lastElemCollid.collider.rayAnswer.normal, ray.direction);
            let d_nori =    vec3.dot(this.lastElemCollid.collider.rayAnswer.normal,ray.origine);

            var t = (this.movementDistance - d_nori) / deno;
            let hit_pts = vec3.add([], ray.origine, vec3.scale([], ray.direction, t));

            let translation = vec3.subtract([], hit_pts,this.lastElemCollid.collider.rayAnswer.point);

            let newPos = vec3.add([], this.currentTranslationObj, translation);

            this.lastElemCollid.matrix.modelMatrix[12] = newPos[0];
            this.lastElemCollid.matrix.modelMatrix[13] = newPos[1];
            this.lastElemCollid.matrix.modelMatrix[14] = newPos[2];
        }
    };
}