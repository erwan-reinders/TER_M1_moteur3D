#version 300 es
precision highp float;

layout (location = 0) out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D gPosition;
uniform sampler2D gNormal;
uniform sampler2D gAlbedoSpec;

uniform vec3 uViewPos;
uniform samplerCube skybox;

void main()
{         
    //if (FragPos.x > 0.01 || FragPos.y > 0.01 || FragPos.z > 0.01 || FragPos.x < -0.01 || FragPos.y < -0.01 || FragPos.z < -0.01) {

    vec3 FragPos = texture(gPosition, TexCoords).rgb;
    vec3 Normal = texture(gNormal, TexCoords).rgb;
    vec3 Diffuse = texture(gAlbedoSpec, TexCoords).rgb;
    float Specular = texture(gAlbedoSpec, TexCoords).a;

    vec3 I = normalize(FragPos - uViewPos);
    vec3 R = reflect(I, Normal);
    //FragColor = vec4(texture(skybox, R).rgb * Diffuse, 1.0);

    vec3 cubemapColor = texture(skybox, R).rgb;
    //vec3 cubemapColor = texture(skybox, normalize(vec3(TexCoords*2.0-1.0, 0.5))).rgb;
    //vec3 cubemapColor = vec3(1.0, 0.0, 0.0);

    //FragColor = vec4(cubemapColor, 1.0);
    
    //FragColor = vec4(texture(skybox, normalize(vec3(TexCoords*2.0-1.0, .5))).rgb, 1.0);
    //FragColor = vec4(R*0.5+color*0.5, 1.0);

    FragColor = vec4(cubemapColor, 1.0);
}