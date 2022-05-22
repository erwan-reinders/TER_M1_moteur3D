/**
 * Génère un programme à partir des identifiants des balises contenant les shaders.
 * @param {string} id_vertex_shader L'id de l'element contenant le vertex shader.
 * @param {string} id_fragment_shader L'id de l'element contenant le fragment shader.
 * @returns {WebGLProgram} Le programme généré.
 */
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

/**
 * Génère un programme à partir des chemins vers les fichiers contenant les shaders.
 * @param {string} file_vertex_shader Chemin vers le fichier du vertex shader
 * @param {string} file_fragment_shader Chemin vers le fihier du fragment shader
 * @returns {WebGLProgram} Le programme généré.
 */
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

/**
 * Génère un programme à partir du code source des shaders.
 * @param {string} vsSource Le code source du vertex shader.
 * @param {string} fsSource Le code source du fragment shader.
 * @returns {WebGLProgram} Le programme généré.
 */
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

/**
 * Génère et compile un shader à partir du code source.
 * @param {number} type Le type de shader à générer (Soit gl.VERTEX_SHADER, soit gl.FRAGMENT_SHADER).
 * @param {string} source Le code source du shader.
 * @returns {WebGLShader} Le shader généré.
 */
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

/**
 * Enumération permettant de définir un type d'uniform.
 */
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
    texture2D : function (emplacement, v, texture){
        gl.uniform1i(emplacement, v);
        gl.activeTexture(gl.TEXTURE0 + v);
        gl.bindTexture(gl.TEXTURE_2D, texture);
    },
    textureCubeMap : function (emplacement, v, texture){
        gl.uniform1i(emplacement, v);
        gl.activeTexture(gl.TEXTURE0 + v);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
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

/**
 * Classe modélisant un programme shader.
 */
class ShaderProgram {

    /**
     * Constructeur d'un programme shader
     * @param {string} vertexShaderFile Chemin vers le fichier du vertexShader
     * @param {string} fragmentShaderFile Chemin vers le fichier du fragmentShader
     */
    constructor(vertexShaderFile, fragmentShaderFile) {
        this.programID = undefined;

        this.uniforms = new Map();
        this.vsFile = vertexShaderFile;
        this.fsFile = fragmentShaderFile;

        this.init();
    }

    /**
     * Initialise le programme shader à partir du chemin vers les shaders.
     */
    init(){
        try {
            let prg = initShaderProgramFromFile(this.vsFile, this.fsFile);
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

    /**
     * Initialise le programme shader à partir des id des balises contenant les shaders.
     */
    initFromId(){
        try {
            let prg = initShaderProgramFromHTMLId(this.vsFile, this.fsFile);
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

    /**
     * Initialise les positions des uniformes
     */
    setAllPos(){
        this.uniforms.forEach((value, key) => {
            value.pos = gl.getUniformLocation(this.programID, key);
        });
    }

    /**
     * Définit un uniform.
     * @param {string} elem Nom de l'uniform, doit être identique à celui du le shader.
     * @param {valType} vtype Type de l'uniform.
     */
    setUniform(elem, vtype){
        this.uniforms.set(elem, {
            pos : undefined,
            val : undefined,
            type : vtype,
        });
    }

    /**
     * Affecte une valeur dans l'uniform à partir de son nom.
     * @param {string} name Nom de l'uniform.
     * @param {Float32Array} val Valeur de l'uniform.
     * @param {*} param1 Paramètre supplémentaire.
     */
    setUniformValueByName(name, val, param1){
        let elem = this.uniforms.get(name);
        if(elem !== undefined){
            elem.val = val;
            elem.type(elem.pos, val, param1);
        }else{
            message.error("SHADER", "set uniform value undefined " + name, Error().lineNumbe);
        }
    }

    /**
     * Affecte une valeur dans l'uniform à partir de sa position.
     * @param {number} pos Position de l'uniform.
     * @param {Float32Array}val Valeur de l'uniform.
     */
    setUniformValueByPos(pos, val){
        let elem = undefined;
        for (const [key, value] of this.uniforms) {
            if(value.pos === pos){
                elem = value;
                break;
            }
        }
        if(elem !== undefined){
            elem.val = val;
        }else{
            message.error("SHADER", "set uniform value undefined " + pos, Error().lineNumbe);
        }
    }

    /**
     * Permet d'utilise le programme shader.
     */
    use(){
        gl.useProgram(this.programID);
    }

    /**
     * Envoie toutes les données des uniform dans le programme.
     */
    commitValues(){
        this.uniforms.forEach((value, key) => {
            if(value.val) {
                value.type(value.pos, value.val);
            }
        });
    }

    /**
     * Génère une chaine de charactères représentant la liste des uniforms.
     * @returns {string} La chaine générée.
     */
    toStringUniforms(){
        let res = "";
        this.uniforms.forEach((value, key) => {
            res += "name : " + key + "\n";
            res += "pos : " + value.pos + "\n";
            res += "val : " + value.val + "\n";
            res += "type : " + value.type + "\n";
        });
        return res;
    }
    /**
     * Génère une chaine de charactères contenant les nom des fichiers utilisé pour générer le programme shader.
     * @returns {string} La chaine générée.
     */
    toString(){
        return "SHADER : \n VSFILE : " + this.vsFile + "\n FSFILE : " + this.fsFile + "\n";
    }
}