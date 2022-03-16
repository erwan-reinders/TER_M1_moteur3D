/*Classe modélisant un modèle*/
class Model {
    /**Constructeur d'un model
    * @param gl : OpenGL représentant le contexte de dessin WEBGL du canvas de rendu
    * @param modelData : ObjetModel renseignant les sommets, la géométrie et les normales d'un objet 3D représentant notre modèle
    * @param texture : Texture à appliquer à notre modèle
    * @param vertexSH : ID_HTMLVertexShader du programme de dessin du modèle
    * @param fragmentSH : ID_HTMLFragmentShader du programme de dessin du modèle
    * @param hauteur : Hauteur de la zone de dessin (canva.height)
    * @param largeur : Largeur de la zone de dessin (canva.width)
    * @param rotator : trackball rotator**/
    constructor(gl,modelData, texture, vertexSH_id,fragmentSH_id,hauteur,largeur,rotator) {
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
                vertexPosition : this.gl.getAttribLocation(this.prog, 'aVertexPosition'),
                vertexNormal   : this.gl.getAttribLocation(this.prog, 'aVertexNormal'),
                vertexUV       : this.gl.getAttribLocation(this.prog, 'aVertexUV'),
            },
            uniformLocations : {
                modelMatrix      : this.gl.getUniformLocation(this.prog, 'uModelMatrix'),
                texture          : this.gl.getUniformLocation(this.prog, "texture"),
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

    init(){
        this.texture.init();
        this.gl.useProgram(this.prog);
        this.createModel();
    }

    createModel(){
        this.model = {};
        this.model.coordsBuffer = this.gl.createBuffer();
        this.model.normalBuffer = this.gl.createBuffer();
        this.model.texCoordsBuffer = this.gl.createBuffer();
        this.model.indexBuffer = this.gl.createBuffer();
        this.model.count = this.modelData.indices.length;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.model.coordsBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.modelData.vertexPositions, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.model.normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.modelData.vertexNormals, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.model.texCoordsBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.modelData.vertexTextureCoords, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.model.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.modelData.indices, this.gl.STATIC_DRAW);
        let obj = this;
        this.model.render = function() {
            obj.gl.bindBuffer(obj.gl.ARRAY_BUFFER, obj.model.coordsBuffer);
            obj.gl.vertexAttribPointer(obj.programInfo.attribLocations.vertexPosition, 3, obj.gl.FLOAT, false, 0, 0);
            obj.gl.bindBuffer(obj.gl.ARRAY_BUFFER, obj.model.normalBuffer);
            obj.gl.vertexAttribPointer(obj.programInfo.attribLocations.vertexNormal, 3, obj.gl.FLOAT, false, 0, 0);
            obj.gl.bindBuffer(obj.gl.ARRAY_BUFFER, obj.model.texCoordsBuffer);
            obj.gl.vertexAttribPointer(obj.programInfo.attribLocations.vertexUV, 2, obj.gl.FLOAT, false, 0, 0);

            obj.gl.uniformMatrix4fv(obj.programInfo.uniformLocations.modelMatrix, false, obj.matrix.modelMatrix);

            //mat3.normalFromMat4(obj.normalMatrix, obj.matrix.modelMatrix);
            //obj.gl.uniformMatrix3fv(obj.u_transformation, false, obj.transformation);
            //obj.gl.uniform3f(obj.u_translation, obj.translation[0],obj.translation[1],obj.translation[2]);
            //obj.gl.uniformMatrix3fv(obj.u_normalMatrix, false, obj.normalMatrix);

            obj.gl.bindBuffer(obj.gl.ELEMENT_ARRAY_BUFFER, obj.model.indexBuffer);
            obj.gl.drawElements(obj.gl.TRIANGLES, obj.model.count, obj.gl.UNSIGNED_SHORT, 0);
        };
    }

    render(){
        //On rend d'abord la texture asoociée à l'objet
        this.texture.rendre();
        //this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null);

        this.gl.useProgram(this.prog);

        //this.gl.clearColor(0,0,0,1);
        //this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        //this.gl.enable(this.gl.DEPTH_TEST);
        //this.gl.viewport(0,0,this.largeur,this.hauteur);

        this.gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
        this.gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
        this.gl.enableVertexAttribArray(programInfo.attribLocations.vertexUV);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture.texture);

        this.matrix.modelMatrix = this.rotator.getViewMatrix();
        this.model.render();

        this.gl.disableVertexAttribArray(programInfo.attribLocations.vertexPosition);
        this.gl.disableVertexAttribArray(programInfo.attribLocations.vertexNormal);
        this.gl.disableVertexAttribArray(programInfo.attribLocations.vertexUV);
    }



}