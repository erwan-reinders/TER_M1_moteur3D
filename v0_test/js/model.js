/*Classe modélisant un modèle*/


class Model {
    /**Constructeur d'un model
    * @param modelData : ObjetModel renseignant les sommets, la géométrie et les normales d'un objet 3D représentant notre modèle
    * @param shaderKey : Key cle key c'est clef en françait pour le shader ("programme sur GPU ("carte graphique")")**/
    constructor(modelData, shaderKey) {
        this.shader = shaders.get(shaderKey);

        this.modelData = modelData;

        this.matrix = {
            normalMatrix     : mat4.create(),
            modelMatrix      : mat4.create(),
        }
        this.programInfo = {
            attribLocations : {
                vertexPosition : 0,
                vertexNormal   : 1,
                vertexUV       : 2,
            },
        };

        this.init();
    }

    init(){
        this.createModel();
    }

    createModel(){
        this.shader.use();
        this.model = {};
        this.model.coordsBuffer = gl.createBuffer();
        this.model.normalBuffer = gl.createBuffer();
        this.model.texCoordsBuffer = gl.createBuffer();
        this.model.indexBuffer = gl.createBuffer();
        this.model.count = this.modelData.indices.length;
        //TODO VBO
        //gl.initVBO
        gl.bindBuffer(gl.ARRAY_BUFFER, this.model.coordsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.modelData.vertexPositions, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.model.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.modelData.vertexNormals, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.model.texCoordsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.modelData.vertexTextureCoords, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.model.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.modelData.indices, gl.STATIC_DRAW);
        //gl.atribPointer
        //gl.endVBO
        let obj = this;
        this.model.render = function() {
            //TODO Bind VBO
            //delete 
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.model.coordsBuffer);
            gl.vertexAttribPointer(obj.programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.model.normalBuffer);
            gl.vertexAttribPointer(obj.programInfo.attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.model.texCoordsBuffer);
            gl.vertexAttribPointer(obj.programInfo.attribLocations.vertexUV, 2, gl.FLOAT, false, 0, 0);
            //fin delete

            //mat3.normalFromMat4(obj.normalMatrix, obj.matrix.modelMatrix);
            //gl.uniformMatrix3fv(obj.u_transformation, false, obj.transformation);
            //gl.uniform3f(obj.u_translation, obj.translation[0],obj.translation[1],obj.translation[2]);
            //gl.uniformMatrix3fv(obj.u_normalMatrix, false, obj.normalMatrix);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.model.indexBuffer);
            gl.drawElements(gl.TRIANGLES, obj.model.count, gl.UNSIGNED_SHORT, 0);
        };
    }

    render(previousModelToRender){
        //On rend d'abord la texture asoociée à l'objet
        //gl.bindFramebuffer(gl.FRAMEBUFFER,null);

        this.shader.use();
        let beforeValue = this.shader.beforeRenderFunction(previousModelToRender, this, scene);

        if (beforeValue != false) {
            //TODO VBO
            gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
            gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexNormal);
            gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexUV);

            this.model.render();

            gl.disableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
            gl.disableVertexAttribArray(this.programInfo.attribLocations.vertexNormal);
            gl.disableVertexAttribArray(this.programInfo.attribLocations.vertexUV);
        }

        this.shader.afterRenderFunction(previousModelToRender, this, scene);
    }

    updateNormalMatrix() {
        this.matrix.normalMatrix = mat4.transpose([], mat4.invert([], this.matrix.normalMatrix));
    }
}