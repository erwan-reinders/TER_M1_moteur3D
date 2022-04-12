class Input {
    constructor(name) {
        this.name = name;
        this.value = false;
    }
}

class Controller {

    constructor(scene) {
        this.keyControls = new Map();
        this.scene = scene;
        this.initControls();
    }

    initControls() {
        this.keyControls.set("up",       new Input("ArrowUp"));
        this.keyControls.set("down",     new Input("ArrowDown"));
        this.keyControls.set("left",     new Input("ArrowRight"));
        this.keyControls.set("right",    new Input("ArrowLeft"));
        this.keyControls.set("forward",  new Input("z"));
        this.keyControls.set("backward", new Input("s"));
    }

    onKeyDown(event) {
        for (let input of this.keyControls) {
            if (event.key == input[1].name) {
                input[1].value = true;
            }
        }
    }

    onKeyUp(event) {
        for (let input of this.keyControls) {
            if (event.key == input[1].name) {
                input[1].value = false;
            }
        }
    }

    onMouseMove(event) {
        //console.log(event);
    }

    onMouseDown(event) {
        //console.log(event);
    }

    onMouseUp(event) {
        //console.log(event);
    }

    processInput() {
        let move = vec3.create();

        let cameraForward = this.scene.current_camera.getForward();
        let cameraUp = this.scene.current_camera.up;
        let cameraRight = vec3.cross([], cameraForward, cameraUp);

        let speed = 0.1;
        let speedVec = vec3.fromValues(speed, speed, speed);
        let speedVecInv = vec3.fromValues(-speed, -speed, -speed);
        
        if (this.keyControls.get("right").value) {
            vec3.add(move, move, vec3.multiply([], cameraRight, speedVecInv));
        }
        if (this.keyControls.get("left").value) {
            vec3.add(move, move, vec3.multiply([], cameraRight, speedVec));
        }
        if (this.keyControls.get("up").value) {
            vec3.add(move, move, vec3.clone([0.0, speed, 0.0]));
        }
        if (this.keyControls.get("down").value) {
            vec3.add(move, move, vec3.clone([0.0, -speed, 0.0]));
        }
        if (this.keyControls.get("forward").value) {
            vec3.add(move, move, vec3.clone([0.0, 0.0, -speed]));
        }
        if (this.keyControls.get("backward").value) {
            vec3.add(move, move, vec3.clone([0.0, 0.0, speed]));
        }
        vec3.add(this.scene.current_camera.position, this.scene.current_camera.position, move);
        //vec3.add(scene.current_light.position, scene.current_light.position, move);
    }
}