/*Classe modélisant un modèle*/


class Model {
    /**Constructeur d'un model
    * @param modelData : ObjetModel renseignant les sommets, la géométrie et les normales d'un objet 3D représentant notre modèle
    * @param texture : Texture à appliquer à notre modèle
    * @param vertexSH : ID_HTMLVertexShader du programme de dessin du modèle
    * @param fragmentSH : ID_HTMLFragmentShader du programme de dessin du modèle
    * @param hauteur : Hauteur de la zone de dessin (canva.height)
    * @param largeur : Largeur de la zone de dessin (canva.width)
    * @param rotator : trackball rotator**/
    constructor(modelData, texture, vertexSH_id,fragmentSH_id,hauteur,largeur,rotator) {
        this.createProgram();
        this.modelData = modelData;
        this.texture = texture;
        this.hauteur = hauteur;
        this.largeur = largeur;

        this.rotator = rotator;

        this.matrix = {
            modelMatrix      : mat4.create(),
        }
        this.programInfo = {
            attribLocations : {
                vertexPosition : gl.getAttribLocation(this.prog, 'aVertexPosition'),
                vertexNormal   : gl.getAttribLocation(this.prog, 'aVertexNormal'),
                vertexUV       : gl.getAttribLocation(this.prog, 'aVertexUV'),
            },
            uniformLocations : {
                modelMatrix      : gl.getUniformLocation(this.prog, 'uModelMatrix'),
                texture          : gl.getUniformLocation(this.prog, "texture"),
            }
        };
    }


    /*Méthode permettant de créer le programme à partir des shaders*/
    createProgram(){
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
        let vsh = gl.createShader( gl.VERTEX_SHADER );
        gl.shaderSource(vsh,vertexShaderSource);
        gl.compileShader(vsh);
        if ( ! gl.getShaderParameter(vsh, gl.COMPILE_STATUS) ) {
            throw "Error in vertex shader:  " + gl.getShaderInfoLog(vsh);
        }
        let fsh = gl.createShader( gl.FRAGMENT_SHADER );
        gl.shaderSource(fsh, fragmentShaderSource);
        gl.compileShader(fsh);
        if ( ! gl.getShaderParameter(fsh, gl.COMPILE_STATUS) ) {
            throw "Error in fragment shader:  " + gl.getShaderInfoLog(fsh);
        }
        let prog = gl.createProgram();
        gl.attachShader(prog,vsh);
        gl.attachShader(prog, fsh);
        gl.linkProgram(prog);
        if ( ! gl.getProgramParameter( prog, gl.LINK_STATUS) ) {
            throw "Link error in program:  " + gl.getProgramInfoLog(prog);
        }
        this.prog = prog;
    }

    init(){
        this.texture.init();
        gl.useProgram(this.prog);
        this.createModel();
    }

    createModel(){
        this.model = {};
        this.model.coordsBuffer = gl.createBuffer();
        this.model.normalBuffer = gl.createBuffer();
        this.model.texCoordsBuffer = gl.createBuffer();
        this.model.indexBuffer = gl.createBuffer();
        this.model.count = this.modelData.indices.length;
        gl.bindBuffer(this.gl.ARRAY_BUFFER, this.model.coordsBuffer);
        gl.bufferData(this.gl.ARRAY_BUFFER, this.modelData.vertexPositions, this.gl.STATIC_DRAW);
        gl.bindBuffer(this.gl.ARRAY_BUFFER, this.model.normalBuffer);
        gl.bufferData(this.gl.ARRAY_BUFFER, this.modelData.vertexNormals, this.gl.STATIC_DRAW);
        gl.bindBuffer(this.gl.ARRAY_BUFFER, this.model.texCoordsBuffer);
        gl.bufferData(this.gl.ARRAY_BUFFER, this.modelData.vertexTextureCoords, this.gl.STATIC_DRAW);
        gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.model.indexBuffer);
        gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.modelData.indices, this.gl.STATIC_DRAW);
        let obj = this;
        this.model.render = function() {
            gl.bindBuffer(obj.gl.ARRAY_BUFFER, obj.model.coordsBuffer);
            gl.vertexAttribPointer(obj.programInfo.attribLocations.vertexPosition, 3, obj.gl.FLOAT, false, 0, 0);
            gl.bindBuffer(obj.gl.ARRAY_BUFFER, obj.model.normalBuffer);
            gl.vertexAttribPointer(obj.programInfo.attribLocations.vertexNormal, 3, obj.gl.FLOAT, false, 0, 0);
            gl.bindBuffer(obj.gl.ARRAY_BUFFER, obj.model.texCoordsBuffer);
            gl.vertexAttribPointer(obj.programInfo.attribLocations.vertexUV, 2, obj.gl.FLOAT, false, 0, 0);

            gl.uniformMatrix4fv(obj.programInfo.uniformLocations.modelMatrix, false, obj.matrix.modelMatrix);

            //mat3.normalFromMat4(obj.normalMatrix, obj.matrix.modelMatrix);
            //obj.gl.uniformMatrix3fv(obj.u_transformation, false, obj.transformation);
            //obj.gl.uniform3f(obj.u_translation, obj.translation[0],obj.translation[1],obj.translation[2]);
            //obj.gl.uniformMatrix3fv(obj.u_normalMatrix, false, obj.normalMatrix);

            gl.bindBuffer(obj.gl.ELEMENT_ARRAY_BUFFER, obj.model.indexBuffer);
            gl.drawElements(obj.gl.TRIANGLES, obj.model.count, obj.gl.UNSIGNED_SHORT, 0);
        };
    }

    render(){
        //On rend d'abord la texture asoociée à l'objet
        this.texture.render();
        //this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null);

        gl.useProgram(this.prog);

        //this.gl.clearColor(0,0,0,1);
        //this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        //this.gl.enable(this.gl.DEPTH_TEST);
        //this.gl.viewport(0,0,this.largeur,this.hauteur);

        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexUV);
        gl.bindTexture(this.gl.TEXTURE_2D, this.texture.texture);

        this.matrix.modelMatrix = this.rotator.getViewMatrix();
        this.model.render();

        gl.disableVertexAttribArray(programInfo.attribLocations.vertexPosition);
        gl.disableVertexAttribArray(programInfo.attribLocations.vertexNormal);
        gl.disableVertexAttribArray(programInfo.attribLocations.vertexUV);
    }
}