/*Classe modélisant un modèle*/
class Model {

    /**Constructeur d'un model
    * @param modelData ObjetModel renseignant les sommets, la géométrie et les normales d'un objet 3D représentant notre modèle
    **/
    constructor(modelData) {
        this.modelData = modelData;

        this.matrix = {
            modelMatrix  : mat4.create(),
            normalMatrix : mat4.create()
        }

        this.init();
    }

    /**
     * Fonction d'initialisation
     */
    init(){
        this.createModel();
    }

    /**
     * Génère et attribue les buffers du modèle.
     */
    createModel(){
        this.model = {};
        this.model.vao = gl.createVertexArray();
        this.model.coordsBuffer = gl.createBuffer();
        this.model.normalBuffer = gl.createBuffer();
        this.model.texCoordsBuffer = gl.createBuffer();
        this.model.indexBuffer = gl.createBuffer();
        this.model.count = this.modelData.indices.length;

        gl.bindVertexArray(this.model.vao);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.model.coordsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.modelData.vertexPositions, gl.STATIC_DRAW);
        //                    (index, size, type    , normalized, stride, offset)
        gl.vertexAttribPointer(0    , 3   , gl.FLOAT, false     , 0     , 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.model.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.modelData.vertexNormals, gl.STATIC_DRAW);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.model.texCoordsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.modelData.vertexTextureCoords, gl.STATIC_DRAW);
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.model.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.modelData.indices, gl.STATIC_DRAW);

        if (!gl.isVertexArray(this.model.vao)) {
            message.error("CREATE MODEL BUFFERS", "Failed to create vertex atribute array.");
        }

        gl.bindVertexArray(null);
    }

    /**
     * Fait un rendu du modèle
     */
    render(mode = gl.TRIANGLES){
        gl.bindVertexArray(this.model.vao);

        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);

        //             (mode        , count           , type             , offset)
        gl.drawElements(mode, this.model.count, gl.UNSIGNED_SHORT, 0);

        gl.disableVertexAttribArray(0);
        gl.disableVertexAttribArray(1);
        gl.disableVertexAttribArray(2);
    }

    /**
     * Met à jour le modèle
     */
    update() {
        this.updateNormalMatrix();
        if(this.collider){
            this.collider.transform(this.matrix.modelMatrix);
        }
    }

    /**
     * Met à jour la matrice de normales.
     */
    updateNormalMatrix() {
        this.matrix.normalMatrix = mat4.transpose([], mat4.invert([], this.matrix.modelMatrix));
    }
}