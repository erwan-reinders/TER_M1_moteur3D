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
    vec3 FragPos = texture(gPosition, TexCoords).rgb;
    
    vec3 Normal = texture(gNormal, TexCoords).rgb;
    vec3 Diffuse = texture(gAlbedoSpec, TexCoords).rgb;
    float Specular = texture(gAlbedoSpec, TexCoords).a;

    vec3 I = normalize(FragPos - uViewPos);
    vec3 R = reflect(I, Normal);

    vec3 cubemapColor = texture(skybox, R).rgb;

    FragColor = vec4(cubemapColor, 1.0);
}