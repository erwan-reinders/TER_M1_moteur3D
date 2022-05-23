/*Classe modélisant un matériel*/
class Material {
    /** Constructeur d'un materiau applicable sur un objet de la scène
     * @param  {String} albedoMap               : la carte de couleur de l'objet (par défaut)
     * @param  {String} normalMap               : la carte de déplacement des normales de l'objet
     * @param  {String} metallicMap             : la carte de coefficient métalique de l'objet
     * @param  {String} roughnessMap            : la carte de rugosité
     * @param  {String} aoMap                   : l'occlusion ambiante
     * @param  {Float32Array} albedoCoef        : Coefficient d'albedo
     * @param  {Number} metallicCoef            : Coefficient de métal
     * @param  {Number} roughnessCoef           : Coefficient de rugosité
     * @param  {Number} aoCoef                  : Coefficient d'occlusion ambiante
     * @param  {Boolean} renderWithObjCoef      : Indique si on doit prendre en compte les coef donnés à l'objet ou ceux des sliders
     * **/
    constructor(
        albedoMap = "data/img/white.png" ,
        normalMap= "data/img/pbr/rusted_iron/rustediron2_normal_small.png",
        metallicMap="data/img/white.png",
        roughnessMap="data/img/white.png",
        aoMap="data/img/white.png",
        albedoCoef = vec3.clone([1,1,1]),
        metallicCoef= 1.0,
        roughnessCoef = 1.0,
        aoCoef=1.0,
        renderWithObjCoef = false
    ) {
        this.renderWithObjCoef = renderWithObjCoef;
        this.albedoMap    = getTextureImage(albedoMap);
        this.normalMap    = getTextureImage(normalMap);
        this.metallicMap  = getTextureImage(metallicMap);
        this.roughnessMap = getTextureImage(roughnessMap);
        this.aoMap        = getTextureImage(aoMap);

        this.coefAlbedo     = albedoCoef;
        this.coefMetal      = metallicCoef;
        this.coefRough      = roughnessCoef;
        this.coefAO         = aoCoef;
    }
}