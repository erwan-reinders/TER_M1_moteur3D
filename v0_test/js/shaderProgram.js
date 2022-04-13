//Function for create program for shader ID
function initShaderProgramFromHTMLId(id_vertex_shader, id_fragment_shader){
    let vertexShaderSource, fragmentShaderSource;
    try {
        vertexShaderSource = getTextContent( id_vertex_shader );
        fragmentShaderSource = getTextContent( id_fragment_shader );
    }
    catch (e) {
        throw "Error: Could not get shader source code from script elements.";
    }
    return initShaderProgram(vertexShaderSource, fragmentShaderSource);
}

function initShaderProgramFromFile(file_vertex_shader, file_fragment_shader) {
    let shaderPath = "data/shaders/";
    let vertexShaderSource, fragmentShaderSource;
    try {
        vertexShaderSource = loadFile( shaderPath + file_vertex_shader );
        fragmentShaderSource = loadFile( shaderPath + file_fragment_shader );
    }
    catch (e) {
        throw "Error: Could not get shader source code from file.";
    }
    return initShaderProgram(vertexShaderSource, fragmentShaderSource);
}

//Initialize a shader program, so WebGL knows how to draw our data
function initShaderProgram(vsSource, fsSource) {
    const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

//creates a shader of the given type, uploads the source and compiles it.
function loadShader(type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object
    gl.shaderSource(shader, source);

    // Compile the shader program
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(shader);
        console.error('glsl:' + error);
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}


const valType = {
    f1 : function (emplacement, v){
        gl.uniform1f(emplacement, v);
    },
    f1v : function (emplacement, v){
        gl.uniform1fv(emplacement, v);
    },
    f2 : function (emplacement, v){
        gl.uniform2f(emplacement, v);
    },
    f2v : function (emplacement, v){
        gl.uniform2fv(emplacement, v);
    },
    f3 : function (emplacement, v){
        gl.uniform3f(emplacement, v);
    },
    f3v : function (emplacement, v){
        gl.uniform3fv(emplacement, v);
    },
    f4 : function (emplacement, v){
        gl.uniform4f(emplacement, v);
    },
    f4v : function (emplacement, v){
        gl.uniform4fv(emplacement, v);
    },

    Mat2fv : function (emplacement, v){
        gl.uniformMatrix2fv(emplacement, false, v);
    },
    Mat3fv : function (emplacement, v){
        gl.uniformMatrix3fv(emplacement, false, v);
    },
    Mat4fv : function (emplacement, v){
        gl.uniformMatrix4fv(emplacement, false, v);
    },

    i1 : function (emplacement, v){
        gl.uniform1i(emplacement, v);
    },
    i1v : function (emplacement, v){
        gl.uniform1iv(emplacement, v);
    },
    i2 : function (emplacement, v){
        gl.uniform2i(emplacement, v);
    },
    i2v : function (emplacement, v){
        gl.uniform2iv(emplacement, v);
    },
    i3 : function (emplacement, v){
        gl.uniform3i(emplacement, v);
    },
    i3v : function (emplacement, v){
        gl.uniform3iv(emplacement, v);
    },
    i4 : function (emplacement, v){
        gl.uniform4i(emplacement, v);
    },
    i4v : function (emplacement, v){
        gl.uniform4iv(emplacement, v);
    },
};

/*Class for shader implementation*/
class ShaderProgram {

    /**Constructor for a shader
     * @param vertexShaderID : String ID of the vertexShader
     * @param fragmentShaderID : String ID of the fragmentShader**/
    constructor(vertexShaderID, fragmentShaderID) {
        this.programID = undefined;

        this.uniforms = [];
        this.vsID = vertexShaderID;
        this.fsID = fragmentShaderID;

        this.beforeRenderFunction = function (model, scene) {

        };
        this.afterRenderFunction  = function (model, scene) {
            
        };

        this.init();
    }

    //Function to initialize the shader
    init(){
        try {
            let prg = initShaderProgramFromFile(this.vsID, this.fsID);
            if(prg != null){
                this.programID = prg;
            }else{
                message.error("SYSTEM INIT", "impossible to init shader : \n" + this.toString());
            }
        }catch (e) {
            message.error("SYSTEM INIT", "impossible to get shaders : \n" + this.toString());
            console.log(e);
        }
    }

    initFromId(){
        try {
            let prg = initShaderProgramFromHTMLId(this.vsID, this.fsID);
            if(prg != null){
                this.programID = prg;
            }else{
                message.error("SYSTEM INIT", "impossible to init shader : \n" + this.toString());
            }
        }catch (e) {
            message.error("SYSTEM INIT", "impossible to get shaders : \n" + this.toString());
            console.log(e);
        }
    }

    //Function for init all the pos of attributes
    setAllPos(){
        this.uniforms.forEach(el => {
            el.pos = gl.getUniformLocation(this.programID, el.name);
        });
    }

    /**Function for set a shader uniform value
     * @param elem : String name of the attribute
     * @param vtype : valType type of the att **/
    setUniform(elem, vtype){
        this.uniforms.push({
            name : elem,
            pos : undefined,
            val : undefined,
            type : vtype,
        });
    }

    setBeforeRenderFunction(beforeRenderFunction) {
        this.beforeRenderFunction = beforeRenderFunction;
    }

    setAfterRenderFunction(afterRenderFunction) {
        this.afterRenderFunction = afterRenderFunction;
    }

    /**Function for set uniform value with shader name
     * @param name : String name of the param
     * @param val : Float32Array value of the parameter**/
    setUniformValueByName(name, val){
        //TODO remplacer ça par une map
        let elem = undefined;
        for (let i = 0; i < this.uniforms.length; i++) {
            let element = this.uniforms[i];
            if(element.name === name){
                elem = element;
                break;
            }
        }
        if(elem !== undefined){
            elem.val = val;
            elem.type(elem.pos, val);
        }else{
            message.error("SHADER", "set uniform value undefined " + name, Error().lineNumbe);
        }
    }

    /**Function for set uniform value with shader pos
     * @param pos : Number name of the param
     * @param val : Float32Array value of the parameter**/
    setUniformValueByPos(pos, val){
        let elem = undefined;
        for (let i = 0; i < this.uniforms.length; i++) {
            let element = this.uniforms[i];
            if(element.pos === pos){
                elem = element;
                break;
            }
        }
        if(elem !== undefined){
            elem.val = val;
        }else{
            message.error("SHADER", "set uniform value undefined " + pos, Error().lineNumbe);
        }
    }

    //Function for using the shader
    use(){
        gl.useProgram(this.programID);
    }

    //Function for commiting all the currents values of the shader
    commitValues(){
        this.uniforms.forEach(el => {
            if(el.val) {
                el.type(el.pos, el.val);
            }
        });
    }

    //toString
    toStringUniforms(){
        let res = "";
        this.uniforms.forEach(el => {
            res += "name : " + el.name + "\n";
            res += "pos : " + el.pos + "\n";
            res += "val : " + el.val + "\n";
            res += "type : " + el.type + "\n";
        });
        return res;
    }
    toString(){
        return "SHADER : \n VSID : " + this.vsID + "\n FSID : " + this.fsID + "\n";
    }
}