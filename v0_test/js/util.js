let gl; // Le WebGL2RenderingContext attaché au canvas.
let canvas; // Le HTMLCanvasElement de la page.


let loadingTexture; // Texture à afficher si le chargement d'une texture est toujours en cours.
let loadingCubemap; // Texture à afficher si le chargement d'une texture est toujours en cours.

/**
 * Récupère et initialise le contexte webgl2 du canvas.
 * @param {string} canvasId L'id du canvas.
 * @returns {WebGL2RenderingContext} Le contexte webgl2.
 */
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

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    loadingTexture = getTextureImage("data/img/loading.png", true);
    loadingCubemap = getCubeMapImage([
        "data/img/loading.png",
        "data/img/loading.png",
        "data/img/loading.png",
        "data/img/loading.png",
        "data/img/loading.png",
        "data/img/loading.png"
        ], true);

    return gl;
}

// https://stackoverflow.com/questions/36921947/read-a-server-side-file-using-javascript
/**
 * Récupère le contenu d'un fichier.
 * @param {string} filePath Le chemin vers le fichier.
 * @returns {string} Le contenu du fichier.
 */
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
/**
 * Récupère le contenue d'une balise.
 * @param {string} elementID L'id de l'element.
 * @returns {string} Le contenu de la balise.
 */
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

    /**
     * Affiche une information dans la console.
     * @param {string} type Le type de message.
     * @param {string} message Le message à afficher.
     */
    informative : function (type, message){
        if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
            console.info("INFORMATION :\n  - TYPE : "+type+"\n  - INTITULE : "+ message);
        }
        else {
            console.log(this.color_ter.FgBlue + "INFORMATION :" + this.color_ter.FgGreen + "\n  - TYPE : "+ this.color_ter.FgBlack + type + this.color_ter.FgGreen +"\n  - INTITULE : " + this.color_ter.FgBlack + message);
        }
    },
    /**
     * Affiche une erreur dans la console.
     * @param {string} type Le type d'erreur.
     * @param {string} message Le message d'erreur.
     * @param {number} line La ligne de l'erreur.
     */
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

/**
 * Génère une texture à partir du chemin vers une image.
 * @param {string} src Chemin vers l'image.
 * @param {boolean} silence Doit-on afficher un message dans la console lors de la fin du chargement de l'image?
 * @return {WebGLTexture} Texture générée.
 */
function getTextureImage(src, silence = false){
    let img = new Image();

    let texture = initTexture( 3);

    img.addEventListener('load', function() {

        if (!silence) {
            message.informative("IMG LOADER", "I've got the image : " + this.src);
        }

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

function getTextureFromFloats(floatArray, width, height, interpol = gl.NEAREST, wrapping = gl.REPEAT) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.FLOAT, floatArray);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, interpol);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, interpol);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapping);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapping);
    return texture;
}

//https://webglfundamentals.org/webgl/lessons/webgl-cors-permission.html
/**
 * Function for request an image if its not from local region
 * @param img : Image requested
 * @param url : String url of the ressource image
 */
function requestCORSIfNotSameOrigin(img, url) {
    if ((new URL(url, window.location.href)).origin !== window.location.origin) {
        img.crossOrigin = "";
    }
}

/**
 * Function for init the webgl texture
 * @param nbCanal : Number of canals of the texture image (RGB, RGBA, LOG)
 * @return WebGLTexture index for texture
 */
function initTexture( nbCanal){
    let text = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, text);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, /*Default color*/new Uint8Array([0, 0, 255, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    return text;
}

/**
 * Function for determining if a number is a power of two
 * @param value : Number for determination
 */
function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}

/**
 * Permet de calculer une interpolation linéaire entre a et b à la valeur x.
 * @param {number} a La valeur de début.
 * @param {number} b La valeur de fin.
 * @param {number} x La valeur d'interpolation (entre 0.0 et 1.0).
 * @returns a + x * (b - a).
 */
function lerp(a, b, x) {
    return a + x * (b - a);
}


/**
 * Génère une cubemap vide.
 * @param {number} width La largeur de la cubemap.
 * @param {number} height La hauteur de la cubemap.
 * @returns {WebGLTexture} La cubemap générée.
 */
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

function getDepthCubeMap(width, height) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE); 

    for (let i = 0; i < 6; i++) {
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.FLOAT, null);
    }

    return texture;
}


//https://webglfundamentals.org/webgl/lessons/webgl-cube-maps.html
/**
 * Génère une cubemap à partir de 6 images.
 * @param {string[6]} srcs Les 6 chemins vers les 6 fichiers images.
 * @param {boolean} silence Doit-on afficher un message dans la console lors de la fin du chargement de l'image?
 * @returns {Cubemap} La cubemap générée.
 */
function getCubeMapImage(srcs, silence = false) {
    let textureObject = {ready : false, texture : gl.createTexture()};
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, textureObject.texture);

    for (let i = 0; i < 6; i++) {
        let img = new Image();
        var nbImgDone = 0;
        let isPower2 = true;

        img.addEventListener('load', function() {

            if (!silence) {
                message.informative("IMG LOADER", "I've got the cubemap image "+i+" : " + this.src);
            }

            gl.bindTexture(gl.TEXTURE_CUBE_MAP, textureObject.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.SRGB8, gl.RGB, gl.UNSIGNED_BYTE, this);

            if (isPower2 && isPowerOf2(this.width) && isPowerOf2(this.height)) {
                isPower2 = true;
            }
            else {
                isPower2 = false;
            }

            nbImgDone++;
            if (nbImgDone == 6) {
                textureObject.ready = true;
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE); 
            }
        });
        requestCORSIfNotSameOrigin(img, srcs[i]);
        img.src = srcs[i];
    }

    return textureObject;
}


/**
 * ====================================
 * MATH UTIL FUNCTIONS
 * ====================================
 **/

/**
 * Fonction permettant de récupérer le vec3 de coordonnées minimale entre deux vecteurs 3D
 * @param {Float32Array} v1 premier vecteur
 * @param {Float32Array} v2 second vecteur
 **/
function minVec3(v1, v2){
    return vec3.clone([
        ((v1[0] < v2[0]) ? v1[0] : v2[0]),
        ((v1[1] < v2[1]) ? v1[1] : v2[1]),
        ((v1[2] < v2[2]) ? v1[2] : v2[2])
    ]);
}

/**
 * Fonction permettant de récupérer le vec3 de coordonnées maximimale entre deux vecteurs 3D
 * @param {Float32Array} v1 premier vecteur
 * @param {Float32Array} v2 second vecteur
 **/
function maxVec3(v1, v2) {
    return vec3.clone([
        ((v1[0] > v2[0]) ? v1[0] : v2[0]),
        ((v1[1] > v2[1]) ? v1[1] : v2[1]),
        ((v1[2] > v2[2]) ? v1[2] : v2[2])
    ]);
}


/**
 * Fonction permettant de projeter un vec2 sur un autre vec2
 * @param {Float32Array} length vecteur à projeter
 * @param {Float32Array} direction vecteur où projeter
 **/
function ProjectVec2(length, direction) {
    let dot     = vec2.dot(length, direction);
    let magSq   = vec2.dot(direction,direction);
    return vec2.scale([],direction,dot / magSq);
}

/**
 * Fonction permettant de projeter un vec3 sur un autre vec3
 * @param {Float32Array} length vecteur à projeter
 * @param {Float32Array} direction vecteur où projeter
 **/
function ProjectVec3(length,direction) {
    let dot     = vec3.dot(length, direction);
    let magSq   = vec3.dot(direction,direction);
    return vec3.scale([],direction,dot / magSq);
}


/**
 * Fonction permettant de projeter un vec3 sur les axes formées par les colones de la matrice mat
 * @param {Float32Array} vec vecteur à projeter
 * @param {Float32Array} mat matrice de projection
 **/
function projectV3OnM3(vec, mat) {
    let result = vec3.create();
    result[0] = vec3.dot(vec, vec3.clone(mat[0],mat[1],mat[2]));
    result[1] = vec3.dot(vec, vec3.clone(mat[3],mat[4],mat[5]));
    result[2] = vec3.dot(vec, vec3.clone(mat[6],mat[7],mat[8]));
    return result;
}

/**
 * Fonction permettant de passer d'un angle en degré à un angle en radian
 * @param {Number} deg angle en deg
 **/
function degToRad(deg) {
    return Math.PI / 180.0 * deg;
}

/**
 * Fonction permettant de passer d'un angle en radiant à un angle en degré
 * @param {Number} rad angle en rad
 **/
function radToDeg(rad) {
    return 180.0/Math.PI * rad;
}

/**
 * Fonction permettant de comparer deux valeurs à un espilon près*
 * @param {Number} f1 première valeur à comparer
 * @param {Number} f2 seconde valeur à comparer
**/
function compareWithEpsilon(f1, f2) {
    return (Math.abs(f1 - f2) <= Number.EPSILON * Math.max(1.0, Math.max(Math.abs(f1), Math.abs(f2))));
}


/**
 * Fonction permettant de multiplier un vec4 par une mat4
 * @param {Float32Array} v
 * @param {Float32Array} m
 **/
function multVec4Mat4(v,m){
    let res = vec4.create();
    for (let i = 0; i < 4; i++) {
        res[i] = v[0] * m[i*4] + v[1] * m[i*4+1] + v[2] * m[i*4+2] + v[3] * m[i*4+3];
    }
    return res;
}

/**
 * Fonction permettant de multiplier un vec3 par une mat3
 * @param {Float32Array} v
 * @param {Float32Array} m
 * **/
function multVec3Mat3(v,m){
    let res = vec3.create();
    for (let i = 0; i < 3; i++) {
        res[i] = v[0] * m[i*4] + v[1] * m[i*4+1] + v[2] * m[i*4+2] + v[3] * m[i*4+3];
    }
    return res;
}

/**
 * Fonction Permettant de transformer un point d'écran en une coordonnée monde
 * @param {Float32Array} viewportPoint vec3 point de l'écran
 * @param {Float32Array} viewportOrigin vec2 point de début de l'écran
 * @param {Float32Array} viewportSize vec2 taille de l'écran
 * @param {Float32Array} view mat4 matrice de vue
 * @param {Float32Array} projection vec4 matrice de projection
 * **/
function unproject(viewportPoint, viewportOrigin, viewportSize, view, projection) {
    //1) Normaliser les coordonnées du point
    let normalized = [
        (viewportPoint[0] - viewportOrigin[0]) / viewportSize[0],
        (viewportPoint[1] - viewportOrigin[1]) / viewportSize[1],
        viewportPoint[2],
        1.0
    ];

    //2) Passage en coordonnées NDC
    let ndcSpace = vec4.clone([
        normalized[0], normalized[1],
        normalized[2], normalized[3]]
    );

    // X : -1 to 1
    ndcSpace[0] = ndcSpace[0] * 2.0 - 1.0;
    // Y : -1 to 1 (axe inversé)
    ndcSpace[1] = 1.0 - ndcSpace[1] * 2.0;
    ndcSpace[2] = ndcSpace[2] * 2.0 - 1.0;

    //3) NDC -> espace caméra
    let invProjection = mat4.invert([], projection);
    let eyeSpace = multVec4Mat4(ndcSpace, invProjection);

    //4) espace caméra -> espace monde
    let invView = mat4.invert([], view);
    let worldSpace = multVec4Mat4(eyeSpace, invView);

    //5) On enlève la division perspective
    if (!compareWithEpsilon(worldSpace[3], 0.0)) {
        worldSpace[0] /= worldSpace[3];
        worldSpace[1] /= worldSpace[3];
        worldSpace[2] /= worldSpace[3];
    }
    return vec3.clone([worldSpace[0], worldSpace[1], worldSpace[2]]);
}


/**
 * Fonction permettant de récupérer les coorodonnées normalisées quand on clique sur un élément
 * @param {HTMLElement} element
 * @param {*} event position du curseur au moment du clicke
 * **/
function getLinearCursorPosition(element, event) {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    return {
        xcoord : x/(rect.right - rect.left),
        ycoord : y/(rect.bottom - rect.top),
    }
}


function getCursorPosition(element, event) {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    return {
        xcoord : x,
        ycoord : y,

    }
}