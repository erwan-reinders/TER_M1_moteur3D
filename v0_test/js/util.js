var gl;
//
// Get gl from canvas
//
function initGl(canvasId) {
    canvas = document.getElementById(canvasId);
    try {
        gl = canvas.getContext("webgl") ||
            canvas.getContext("experimental-webgl");
        if (!gl) {
            throw "Browser does not support WebGL";
        }
    } catch (e) {
        console.log("Sorry, could not get a WebGL graphics context.");
        return;
    }
}


//
// Get the content from a HTML tag
//
function getTextContent( elementID ) {
    let element = document.getElementById(elementID);

    let node = element.firstChild;
    let str = "";
    while (node) {
        if (node.nodeType == 3) // this is a text node
            str += node.textContent;
        node = node.nextSibling;
    }
    return str;
}

//
// Méthode permettant de créer le programme à partir des shaders
//
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

//
// Initialize a shader program, so WebGL knows how to draw our data
//
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
//
// creates a shader of the given type, uploads the source and
// compiles it.
//
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
