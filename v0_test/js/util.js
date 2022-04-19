let gl;
let canvas;

// Get gl from canvas
function initGl(canvasId) {
    canvas = document.getElementById(canvasId);
    canvas.width = screen.availWidth - 20;
    canvas.height = screen.availHeight - 130;
    try {
        gl = canvas.getContext("webgl2") ||
            canvas.getContext("experimental-webgl");
        if (!gl) {
            throw "Browser does not support WebGL";
        }
    } catch (e) {
        console.log("Sorry, could not get a WebGL graphics context.");
        return;
    }
}

// https://stackoverflow.com/questions/36921947/read-a-server-side-file-using-javascript
function loadFile(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    if (xmlhttp.status==200) {
        result = xmlhttp.responseText;
    }
    else {
        throw "Error loading file "+filePath+".";
    }
    return result;
}

// Get the content from a HTML tag
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

//System message treatment
let message = {
    color_ter : {
        Reset : "\x1b[0m",
        Bright : "\x1b[1m",
        Dim : "\x1b[2m",
        Underscore : "\x1b[4m",
        Blink : "\x1b[5m",
        Reverse : "\x1b[7m",
        Hidden : "\x1b[8m",

        FgBlack : "\x1b[30m",
        FgRed : "\x1b[31m",
        FgGreen : "\x1b[32m",
        FgYellow : "\x1b[33m",
        FgBlue : "\x1b[34m",
        FgMagenta : "\x1b[35m",
        FgCyan : "\x1b[36m",
        FgWhite : "\x1b[37m",

        BgBlack : "\x1b[40m",
        BgRed : "\x1b[41m",
        BgGreen : "\x1b[42m",
        BgYellow : "\x1b[43m",
        BgBlue : "\x1b[44m",
        BgMagenta : "\x1b[45m",
        BgCyan : "\x1b[46m",
        BgWhite : "\x1b[47m",
    },

    informative : function (type, message){
        if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
            console.info("INFORMATION :\n  - TYPE : "+type+"\n  - INTITULE : "+ message);
        }
        else {
            console.log(this.color_ter.FgBlue + "INFORMATION :" + this.color_ter.FgGreen + "\n  - TYPE : "+ this.color_ter.FgBlack + type + this.color_ter.FgGreen +"\n  - INTITULE : " + this.color_ter.FgBlack + message);
        }
    },
    error : function (type, message, line){
        let lin = line ?? 0;
        if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
            console.log(lin + "-");
            console.error("ERREUR DETECTEE :\n  - TYPE : "+ type + "\n  - INTITULE : "+ message);
        }
        else {
            console.log(lin + "-" + this.color_ter.FgRed + "ERREUR DETECTEE :" + this.color_ter.FgYellow + "\n  - TYPE : "+ this.color_ter.FgBlack + type + this.color_ter.FgYellow +"\n  - INTITULE : " + this.color_ter.FgBlack + message);
        }
    },
};


// TEXTURE LOADING

/**Method for loading textures from an image
 * @param src : String for ressource image texture
 * @return WebGLTexture of the image ressource**/
function getTextureImage(src){
    let img = new Image();

    let texture = initTexture( 3);

    img.addEventListener('load', function() {

        message.informative("IMG LOADER", "I've got the image : " + this.src);

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.SRGB8, gl.RGB, gl.UNSIGNED_BYTE, this);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        if (isPowerOf2(this.width) && isPowerOf2(this.height)) {
            // MIP MAP GENERATION
            gl.generateMipmap(gl.TEXTURE_2D);
        }
    });

    requestCORSIfNotSameOrigin(img,src);
    img.src = src;
    return texture;
}

//https://webglfundamentals.org/webgl/lessons/webgl-cors-permission.html
/**Function for request an image if its not from local region
 * @param img : Image requested
 * @param url : String url of the ressource image**/
function requestCORSIfNotSameOrigin(img, url) {
    if ((new URL(url, window.location.href)).origin !== window.location.origin) {
        img.crossOrigin = "";
    }
}

/**Function for init the webgl texture
 * @param nbCanal : Number of canals of the texture image (RGB, RGBA, LOG)
 * @return WebGLTexture index for texture**/
function initTexture( nbCanal){
    let text = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, text);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, /*Default color*/new Uint8Array([0, 0, 255, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    return text;
}

/**Function for determining if a number is a power of two
 * @param value : Number for determination**/
function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}


function getCubeMap(width, height) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE); 

    for (let i = 0; i < 6; i++) {
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.FLOAT, null);
    }

    return texture;
}


//TODO
//https://webglfundamentals.org/webgl/lessons/webgl-cube-maps.html 
function getCubeMapImage(srcs) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    for (let i = 0; i < 6; i++) {
        let img = new Image();
        var nbImgDone = 0;
        let isPower2 = true;

        img.addEventListener('load', function() {

            message.informative("IMG LOADER", "I've got the cubemap image "+i+" : " + this.src);

            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.SRGB8, gl.RGB, gl.UNSIGNED_BYTE, this);

            if (isPower2 && isPowerOf2(this.width) && isPowerOf2(this.height)) {
                isPower2 = true;
            }
            else {
                isPower2 = false;
            }

            nbImgDone++;
            if (nbImgDone == 5) {
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE); 
                
                if (isPower2) {
                    // MIP MAP GENERATION
                    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                }
            }
        });
        requestCORSIfNotSameOrigin(img, srcs[i]);
        img.src = srcs[i];
    }

    return texture;
}