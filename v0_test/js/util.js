let gl;
let canvas;

// Get gl from canvas
function initGl(canvasId) {
    canvas = document.getElementById(canvasId);
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
        console.log(this.color_ter.FgBlue + "INFORMATION :" + this.color_ter.FgGreen + "\n  - TYPE : "+ this.color_ter.FgBlack + type + this.color_ter.FgGreen +"\n  - INTITULE : " + this.color_ter.FgBlack + message);
    },
    error : function (type, message, line){
        let lin = line ?? 0;
        console.log(lin + "-" + this.color_ter.FgRed + "ERREUR DETECTEE :" + this.color_ter.FgYellow + "\n  - TYPE : "+ this.color_ter.FgBlack + type + this.color_ter.FgYellow +"\n  - INTITULE : " + this.color_ter.FgBlack + message);
    },
};