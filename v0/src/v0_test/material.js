class Material {
    constructor() {
        this.albedo = vec3.clone([1, 0, 0]);
        this.roughness = 0.5;
        this.metalness = 0;
        this.ao = 0;

        programInfo = {
            uniformLocations : {
                objectColor      : 'uObjectColor',
                albedo 			 : 'uAlbedo',
                metalness		 : 'uMetalness',
                roughness     	 : 'uRoughness',
            }
        };
    }
}