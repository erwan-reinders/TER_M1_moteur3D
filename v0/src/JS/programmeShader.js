/*Classe modélisant un programmeShader*/

/*Constructeur d'un ProgrammeShader (classe abstraite)
    * @param gl : Objet représentant le contexte de dessin WEBGL du canvas de rendu
    * @param vertexSH : ID_HTMLVertexShader du programme
    * @param fragmentSH : ID_HTMLFragmentShader du programme*/
function ProgrammeShader(gl, vertexSH_id,fragmentSH_id) {
    if(this.constructor === ProgrammeShader){
        throw new Error("Vous ne pouvez pas créer d'objet programme shader");
    }
    //console.log(" ==== JE CONSTRUIT UN PROGRAMME SHADER A PARTIR DE ");
    //console.log(gl);
    //console.log(vertexSH_id);
    //console.log(fragmentSH_id);

    this.id_vertex_shader = vertexSH_id;
    this.id_fragment_shader = fragmentSH_id;
    this.gl = gl;

    //console.log(this);
    //console.log(" ==== FIN DE CONSTRUCTION");
}

ProgrammeShader.prototype.constructor = ProgrammeShader;

/*Méthode permettant de créer le programme à partir des shaders*/
ProgrammeShader.prototype.createProgram = function() {
    function getTextContent( elementID ) {
        let element = document.getElementById(elementID);

        //console.log("MON ELEM GETCTX CREATE PGR");
        //console.log(element);

        let node = element.firstChild;
        let str = "";
        while (node) {
            if (node.nodeType == 3) // this is a text node
                str += node.textContent;
            node = node.nextSibling;
        }
        return str;
    }
    let vertexShaderSource, fragmentShaderSource;
    try {
        vertexShaderSource = getTextContent( this.id_vertex_shader );
        fragmentShaderSource = getTextContent( this.id_fragment_shader );
    }
    catch (e) {
        throw "Error: Could not get shader source code from script elements.";
    }
    let vsh = this.gl.createShader( this.gl.VERTEX_SHADER );
    this.gl.shaderSource(vsh,vertexShaderSource);
    this.gl.compileShader(vsh);
    if ( ! this.gl.getShaderParameter(vsh, this.gl.COMPILE_STATUS) ) {
        throw "Error in vertex shader:  " + this.gl.getShaderInfoLog(vsh);
    }
    let fsh = this.gl.createShader( this.gl.FRAGMENT_SHADER );
    this.gl.shaderSource(fsh, fragmentShaderSource);
    this.gl.compileShader(fsh);
    if ( ! this.gl.getShaderParameter(fsh, this.gl.COMPILE_STATUS) ) {
        throw "Error in fragment shader:  " + this.gl.getShaderInfoLog(fsh);
    }
    let prog = this.gl.createProgram();
    this.gl.attachShader(prog,vsh);
    this.gl.attachShader(prog, fsh);
    this.gl.linkProgram(prog);
    if ( ! this.gl.getProgramParameter( prog, this.gl.LINK_STATUS) ) {
        throw "Link error in program:  " + this.gl.getProgramInfoLog(prog);
    }
    this.prog = prog;
}