/*Classe modélisant un controlleur pour le piclking d'objets dans la scène */

class PickingController {

    /**
     * Construit le controleur.
     */
    constructor() {
        this.previousMouseX = 0.0;
        this.previousMouseY = 0.0;
        this.mouseDiffX = 0.0;
        this.mouseDiffY = 0.0;
    }

    onMouseMove(event) {
        this.mouseDiffX = event.clientX - this.previousMouseX;
        this.mouseDiffY = event.clientY - this.previousMouseY;
        this.previousMouseX = event.clientX;
        this.previousMouseY = event.clientY;
    }

    onMouseDown(event) {
        let t;
        let coord = getCursorPosition(canvas,event);

        console.log("CLICK ON SCREEN !");
        console.log(coord);
        console.log(canvas.getBoundingClientRect());

        let ray = new Ray();
        ray.getPickRay(
            vec2.clone([coord.xcoord,coord.ycoord]),
            vec2.clone([0,0]),
            vec2.clone([canvas.width,canvas.height]),
            scenes[currentScene].camera.getViewMatrix(),
            scenes[currentScene].camera.getProjectionMatrix(),
        );


        t = Number.MAX_VALUE;
        let obj = undefined;

        //On teste ensuite pour tous les éléments possédant un collider
        for (let el of scenes[currentScene].models){
            if(el.collider){
                el.collider.resetRayIntersection();
                //On peut donc lancer un rayon et déterminer le point d'impact
                let collision = el.collider.doesIntersectRayon(ray);
                if(collision && collision.hit){

                    console.log("==== ON A TOUCHE UN ELEMENT DE LA SCENE ====");
                    console.log(collision);
                    console.log(ray);
                    console.log(el.collider);

                    el.collider.rayAnswer.hit       = collision.hit;
                    el.collider.rayAnswer.t         = collision.t;
                    el.collider.rayAnswer.normal    = collision.normal;
                    el.collider.rayAnswer.point     = collision.point;

                    console.log("============================================");

                    let objectT = collision.t;
                    if (objectT < t) {
                        t = objectT;
                        obj  = el;
                    }
                }else{
                    console.log("On a pas touché !");
                    console.log(ray);
                    console.log(el);
                }
            }
        }

        console.log("PLUS PROCHE : ");
        console.log(obj);
        if(obj) obj.collider.drawn = true;
    }


    onMouseUp(event) {
        console.log("STOP CLIKING");
    }

    mouseMove(x, y) {
        if (this.moving) {
            var origin = eye;
            var ray = getEyeRay(this.modelviewProjection.inverse(), (x / 512) * 2 - 1, 1 - (y / 512) * 2);

            var t = (this.movementDistance - this.movementNormal.dot(origin)) / this.movementNormal.dot(ray);
            var hit = origin.add(ray.multiply(t));
            this.renderer.selectedObject.temporaryTranslate(hit.subtract(this.originalHit));

            // clear the sample buffer
            this.renderer.pathTracer.sampleCount = 0;
        }
    };

    mouseUp(x, y) {
        if (this.moving) {
            var origin = eye;
            var ray = getEyeRay(this.modelviewProjection.inverse(), (x / 512) * 2 - 1, 1 - (y / 512) * 2);

            var t = (this.movementDistance - this.movementNormal.dot(origin)) / this.movementNormal.dot(ray);
            var hit = origin.add(ray.multiply(t));
            this.renderer.selectedObject.temporaryTranslate(Vector.create([0, 0, 0]));
            this.renderer.selectedObject.translate(hit.subtract(this.originalHit));
            this.moving = false;
        }
    };

}